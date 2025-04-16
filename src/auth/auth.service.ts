import { ConfigService } from '@app/config';
import { TOKEN_PAIR } from '@app/constant';
import { AutoRedis, PermissionExpr, permissionJudge } from '@app/decorator';
import { JwtService } from '@app/jwt';
import { PrismaService } from '@app/prisma';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'crypto';
import Redis, { Cluster } from 'ioredis';
import { LoginDto } from './dto/login.dto';
import { AccountService } from '../account/account.service';
import { RoleService } from '../role/role.service';
import { TokenPayload } from './dto/token-pair.dto';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class AuthService {
  constructor(
    @AutoRedis() private redis: Redis | Cluster,
    private account: AccountService,
    private role: RoleService,
    private prisma: PrismaService,
    private config: ConfigService,
    private permission: PermissionService,
    private jwt: JwtService,
  ) {}

  async login(data: LoginDto) {
    const valid = await this.account.verifyPassword(data.email, data.password);
    if (!valid) {
      return {
        ok: false,
        reason: '邮箱或密码错误',
      } as const;
    }
    const account = await this.prisma.account.findFirst({
      where: { email: data.email },
      select: {
        id: true,
      },
    });
    await this.setDefaultRole(account.id, process.env.CLIENT_ID);
    return {
      ok: true,
      id: account.id,
    } as const;
  }

  async createTokenPair(id: bigint | string) {
    const accessToken = await this.jwt.sign(
      { id, random: randomBytes(16).toString('base64') },
      'access',
      this.config.get('cache.ttl.auth.token.access'),
      { issuer: process.env.APP_NAME },
    );
    const refreshToken = await this.jwt.sign(
      { id, random: randomBytes(32).toString('base64') },
      'refresh',
      this.config.get('cache.ttl.auth.token.refresh'),
      { issuer: process.env.APP_NAME },
    );
    const tokenPayload = new TokenPayload();
    tokenPayload.access_token = accessToken;
    tokenPayload.refresh_token = refreshToken;
    tokenPayload.expire = {
      access: this.config.get('cache.ttl.auth.token.access'),
      refresh: this.config.get('cache.ttl.auth.token.refresh'),
    };
    tokenPayload.expireAt = {
      access: new Date(
        Date.now() + this.config.get('cache.ttl.auth.token.access'),
      ).toLocaleString(),
      refresh: new Date(
        Date.now() + this.config.get('cache.ttl.auth.token.refresh'),
      ).toLocaleString(),
    };
    return tokenPayload;
  }
  invokeTokenPair(accountId: bigint | string, tokenPayload: TokenPayload) {
    const { access_token, refresh_token, expire } = tokenPayload;
    const multi = this.redis.multi();
    multi.set(TOKEN_PAIR(accountId.toString(), 'access'), access_token);
    multi.set(TOKEN_PAIR(accountId.toString(), 'refresh'), refresh_token);
    multi.pexpire(TOKEN_PAIR(accountId.toString(), 'access'), expire.access);
    multi.pexpire(TOKEN_PAIR(accountId.toString(), 'refresh'), expire.refresh);
    return multi.exec();
  }
  async setDefaultRole(userId: bigint, clientId: string) {
    const defaultRole = await this.role.getDefaultRole(clientId);
    const accountRoles = await this.prisma.account.findFirst({
      where: {
        id: userId,
      },
      include: {
        role: {
          select: {
            id: true,
          },
        },
      },
    });
    if (accountRoles.role.some((role) => role.id === defaultRole.id)) {
      return true;
    }
    await this.prisma.account.update({
      where: {
        id: userId,
      },
      data: {
        role: {
          connect: [...accountRoles.role, { id: defaultRole.id }],
        },
      },
    });
  }
  createCode(clientId: string) {
    const code = createHash('sha512')
      .update(`${randomBytes(32).toString('hex')}${clientId}`)
      .digest('base64')
      .toString();
    return code;
  }
  invokeCode(id: bigint, code: string) {
    const multi = this.redis.multi();
    multi.set(`AUTH::${code}`, id.toString());
    multi.expire(`AUTH::${code}`, this.config.get('cache.ttl.auth.code'));
    return multi.exec();
  }
  revokeCode(code: string) {
    return this.redis.del(`AUTH::${code}`);
  }
  getPayloadFromCode(code: string) {
    return this.redis.get(`AUTH::${code}`);
  }
  createSessionState() {
    return randomUUID();
  }
  invokeSessionState(code: string, clientId: string, sessionState: string) {
    const multi = this.redis.multi();
    const codeToSession = `AUTH::${code}::${clientId}`;
    const clientToSession = `AUTH::${clientId}::SESSION`;
    const sessionToClient = `AUTH::SESSION::${sessionState}`;
    multi.set(clientToSession, sessionState);
    multi.set(sessionToClient, clientId);
    multi.pexpire(codeToSession, this.config.get('cache.ttl.auth.code'));
    multi.pexpire(clientToSession, this.config.get('cache.ttl.auth.code'));
    multi.pexpire(sessionToClient, this.config.get('cache.ttl.auth.code'));
    return multi.exec();
  }
  async revokeSession(code: string, clientId: string) {
    const codeToSession = `AUTH::${code}::${clientId}`;
    const clientToSession = `AUTH::${clientId}::SESSION`;
    const session = await this.redis.get(clientToSession);
    if (!session) {
      return true;
    }
    const sessionToClient = `AUTH::SESSION::${session}`;
    return this.redis.del(codeToSession, clientToSession, sessionToClient);
  }
  active(id: bigint) {
    return this.redis.exists(TOKEN_PAIR(id.toString(), 'access'));
  }
}
