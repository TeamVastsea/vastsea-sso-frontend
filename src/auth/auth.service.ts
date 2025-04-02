import { ConfigService } from '@app/config';
import {
  AUTH_EMAIL_CODE,
  CLIENT_SECRET,
  ID_COUNTER,
  OAUTH_CODE_ID_PAIR,
  TOKEN_PAIR,
  TOKEN_PAIR_META,
} from '@app/constant';
import { AutoRedis } from '@app/decorator';
import { JwtService } from '@app/jwt';
import { PrismaService } from '@app/prisma';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { pbkdf2Sync, randomBytes } from 'crypto';
import Redis, { Cluster } from 'ioredis';
import { Register } from './dto/register.dto';
import { GlobalCounterService } from '@app/global-counter';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    @AutoRedis() private redis: Redis | Cluster,
    private logger: Logger = new Logger(AuthService.name),
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    private cnt: GlobalCounterService,
    private mail: MailerService,
  ) {}

  async createAccount(body: Register) {
    const { email, password, code, profile } = body;
    const dbAccount = await this.prisma.account.findFirst({
      where: { email },
    });
    if (dbAccount) {
      throw new HttpException(`邮箱已存在`, HttpStatus.BAD_REQUEST);
    }
    const emailCode = await this.redis.get(AUTH_EMAIL_CODE(email));
    if (!emailCode) {
      throw new HttpException('您需要先发送验证码', HttpStatus.BAD_REQUEST);
    }
    if (emailCode !== code) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }
    const salt = randomBytes(64).toString('hex');
    const iterations = 1000;
    const hashPwd = this.hashPwd(password, salt, iterations);
    const id = await this.cnt.incr(ID_COUNTER.ACCOUNT);
    const account = await this.prisma.account.create({
      data: {
        id,
        password: hashPwd,
        email,
        salt,
        iterations: 1000,
        profile: {
          create: {
            ...profile,
            nick: profile.nick,
          },
        },
      },
      include: {
        profile: true,
      },
    });
    return { id: account.id, email: account.email, profile: account.profile };
  }

  async createEmailCode(email: string) {
    if (await this.redis.exists(AUTH_EMAIL_CODE(email))) {
      throw new HttpException(
        '请不要重复发送验证码',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const code = randomBytes(80).toString('hex').slice(0, 16);
    const setCodeHandle = this.redis.set(AUTH_EMAIL_CODE(email), code);
    return this.mail
      .sendMail({
        to: email,
        from: this.config.get('email.email'),
        subject: '欢迎注册',
        text: `验证码: ${code}\n有效期 ${Math.floor(this.config.get('cache.ttl.auth.emailCode') / 60)} 分钟
        `,
      })
      .then(() => setCodeHandle)
      .then(() =>
        this.redis.expire(
          AUTH_EMAIL_CODE(email),
          this.config.get('cache.ttl.auth.emailCode'),
        ),
      )
      .then(() => this.config.get('cache.ttl.auth.emailCode'))
      .catch((err) => this.logger.error(err.message, err.stack));
  }

  async getClientSecret(clientId: string) {
    const clientSecret = await this.redis.get(CLIENT_SECRET(clientId));
    if (clientSecret) {
      return clientSecret;
    }
    const client = await this.prisma.client.findFirst({
      where: {
        clientId,
      },
      select: {
        clientSecret: true,
      },
    });
    if (!client) {
      throw new HttpException('客户端不存在', HttpStatus.BAD_REQUEST);
    }
    await this.redis.set(CLIENT_SECRET(clientId), client.clientSecret);
    await this.redis.expire(
      CLIENT_SECRET(clientId),
      this.config.get('cache.ttl.client.secret'),
    );
    return client.clientSecret;
  }

  async generateToken(code: string, clientId: string, clinetSecret: string) {
    const key = OAUTH_CODE_ID_PAIR(code);
    const miss = !(await this.redis.exists(key));
    if (miss) {
      throw new HttpException('授权码过期', HttpStatus.UNAUTHORIZED);
    }
    const oauthCodePair = (await this.redis.hgetall(key)) as unknown as {
      clientId: string;
      clientSecret: string;
      accountId: string;
    };
    if (oauthCodePair.clientId !== clientId) {
      throw new HttpException(
        '授权码对应的ClientId与传入的ClientId 不一致',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (oauthCodePair.clientSecret !== clinetSecret) {
      throw new HttpException('Client Secret 错误', HttpStatus.BAD_REQUEST);
    }
    const { access, refresh } = await this.generateTokenPair(
      oauthCodePair.accountId,
    );
    if (
      (await this.redis.pttl(
        TOKEN_PAIR(oauthCodePair.accountId, clientId, 'access'),
      )) > 1000
    ) {
      const access_token = await this.redis.get(
        TOKEN_PAIR(oauthCodePair.accountId, clientId, 'access'),
      );
      const refresh_token = await this.redis.get(
        TOKEN_PAIR(oauthCodePair.accountId, clientId, 'refresh'),
      );
      const expire = {
        access: await this.redis.pttl(
          TOKEN_PAIR(oauthCodePair.accountId, clientId, 'access'),
        ),
        refresh: await this.redis.pttl(
          TOKEN_PAIR(oauthCodePair.accountId, clientId, 'access'),
        ),
      };
      const expireAt = {
        access: `${Date.now() + expire.access}`,
        refresh: `${Date.now() + expire.refresh}`,
      };
      return {
        access_token,
        refresh_token,
        expire,
        expireAt,
      };
    }
    const multi = this.redis.multi();
    multi.set(TOKEN_PAIR(oauthCodePair.accountId, clientId, 'access'), access);
    multi.set(
      TOKEN_PAIR(oauthCodePair.accountId, clientId, 'refresh'),
      refresh,
    );

    multi.pexpire(
      TOKEN_PAIR(oauthCodePair.accountId, clientId, 'access'),
      this.config.get('cache.ttl.auth.token.access'),
    );
    multi.pexpire(
      TOKEN_PAIR(oauthCodePair.accountId, clientId, 'refresh'),
      this.config.get('cache.ttl.auth.token.refresh'),
    );
    multi.hset(TOKEN_PAIR_META(oauthCodePair.accountId, clientId), {
      access: this.config.get('cache.ttl.auth.token.access'),
      refresh: this.config.get('cache.ttl.auth.token.refresh'),
    });
    multi.pexpire(
      TOKEN_PAIR_META(oauthCodePair.accountId, clientId),
      this.config.get('cache.ttl.auth.token.access'),
    );
    await multi.exec();

    const expire = {
      access: this.config.get('cache.ttl.auth.token.access'),
      refresh: this.config.get('cache.ttl.auth.token.refresh'),
    };
    const expireAt = {
      access: `${Date.now() + expire.access}`,
      refresh: `${Date.now() + expire.refresh}`,
    };

    return {
      access_token: access,
      refresh_token: refresh,
      expire,
      expireAt,
    };
  }
  async generateTokenPair(accountId: string | bigint) {
    const access = await this.jwt.sign(
      { id: accountId.toString(), random: randomBytes(16).toString() },
      'access',
      this.config.get('cache.ttl.auth.token.access'),
      { issuer: 'AS' },
    );
    const refresh = await this.jwt.sign(
      { id: accountId.toString(), random: randomBytes(16).toString() },
      'refresh',
      this.config.get('cache.ttl.auth.token.refresh'),
      { issuer: 'AS' },
    );
    return { access, refresh };
  }
  async refreshToken(
    userId: string | bigint,
    refreshToken: string,
    clientId: string,
    clientSecret: string,
  ) {
    const realSecret = await this.getClientSecret(clientId);
    if (realSecret !== clientSecret) {
      throw new HttpException('client secret 错误', HttpStatus.BAD_REQUEST);
    }
    const tokenPair = {
      access: TOKEN_PAIR(userId.toString(), clientId, 'access'),
      refresh: TOKEN_PAIR(userId.toString(), clientId, 'refresh'),
    };
    const realRefreshToken = await this.redis.get(tokenPair.refresh);
    if (!realRefreshToken) {
      throw new HttpException(`刷新令牌已过期`, HttpStatus.BAD_REQUEST);
    }
    if (refreshToken !== realRefreshToken) {
      throw new HttpException(`刷新令牌不正确`, HttpStatus.BAD_REQUEST);
    }
    const { access, refresh } = await this.generateTokenPair(userId);
    const accessExpire = this.config.get('cache.ttl.auth.token.access');
    const refreshExpire = this.config.get('cache.ttl.auth.token.refresh');
    const multi = this.redis.multi();
    multi.set(tokenPair.access, access);
    multi.set(tokenPair.refresh, refresh);
    multi.expire(tokenPair.access, accessExpire);
    multi.expire(tokenPair.refresh, refreshExpire);
    const expireAt = {
      access: `${Date.now() + accessExpire}`,
      refresh: `${Date.now() + refreshExpire}`,
    };
    multi.hset(TOKEN_PAIR_META(userId.toString(), clientId), expireAt);
    await multi.exec();
    return {
      access_token: access,
      refresh_token: refresh,
      expire: {
        access: accessExpire,
        refresh: refreshExpire,
      },
      expireAt,
    };
  }

  async generateAuthCode(email: string, password: string, clientId: string) {
    const client = await this.prisma.client.findFirst({
      where: { clientId },
    });
    if (!client) {
      return {
        ok: false,
        reason: '客户端不存在',
      };
    }
    const dbAccount = await this.prisma.account.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
        salt: true,
        iterations: true,
      },
    });
    if (!dbAccount) {
      return {
        ok: false,
        reason: '用户不存在',
      };
    }
    if (
      !this.verifyPassword(
        password,
        dbAccount.password,
        dbAccount.salt,
        dbAccount.iterations,
      )
    ) {
      return {
        ok: false,
        reason: '邮箱或密码错误',
      };
    }
    const code = randomBytes(32).toString('hex');
    await this.redis.hmset(OAUTH_CODE_ID_PAIR(code), {
      accountId: dbAccount.id.toString(),
      clientId,
      clientSecret: client.clientSecret,
    });
    await this.redis.expire(
      OAUTH_CODE_ID_PAIR(code),
      this.config.get('cache.ttl.auth.code'),
    );
    return { ok: true, code, client };
  }
  verifyPassword(
    password: string,
    hashPassword: string,
    salt: string,
    iterations: number,
  ) {
    return hashPassword === this.hashPwd(password, salt, iterations);
  }
  hashPwd(password: string, salt: string, iterations: number) {
    return pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  }
}
