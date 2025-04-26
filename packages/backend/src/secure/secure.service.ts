import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { createHash, randomBytes } from 'crypto';
import { AutoRedis } from '@app/decorator';
import Redis, { Cluster } from 'ioredis';
import { UpdatePassword } from './dto/update-password';
import { AccountService } from '../account/account.service';
import { isNil } from 'ramda';
import { ForgetPassword } from './dto/forget-password';
import { MailService } from '@app/mail';
import { Account, Profile } from '@prisma/client';
import { ConfigService } from '@app/config';
import { FORGET_PASSWORD, UPDATE_PASSWORD } from '@app/mail/templates';

@Injectable()
export class SecureService {
  constructor(
    private auth: AuthService,
    private account: AccountService,
    private mail: MailService,
    private config: ConfigService,
    private accountService: AccountService,
    @AutoRedis() private redis: Redis | Cluster,
  ) {}
  async updatePassword(data: UpdatePassword) {
    const { code } = data;
    const cacheCode = await this.getCode('update', data.email);
    if (isNil(cacheCode)) {
      throw new HttpException('请先发送验证码', HttpStatus.BAD_REQUEST);
    }
    if (cacheCode !== code) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }
    const account = await this.account.findAccountByEmail(data.email);
    if (isNil(account)) {
      throw new HttpException('账号不存在', HttpStatus.NOT_FOUND);
    }
    const hashOldPassword = await this.account.verifyPassword(
      data.email,
      data.oldPassword,
    );
    if (!hashOldPassword) {
      throw new HttpException('密码错误', HttpStatus.NOT_FOUND);
    }
    await this.account.updateAccount(account.id, {
      password: data.newPassword,
    });
    await this.account.kickout(account.id);
    return;
  }
  async forgetPassword(data: ForgetPassword) {
    const { code } = data;
    const cacheCode = await this.getCode('forget', data.email);
    if (isNil(cacheCode)) {
      throw new HttpException('请先发送验证码', HttpStatus.BAD_REQUEST);
    }
    if (cacheCode !== code) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }
    const account = await this.account.findAccountByEmail(data.email);
    if (isNil(account)) {
      throw new HttpException('账号不存在', HttpStatus.NOT_FOUND);
    }
    await this.account.updateAccount(account.id, {
      password: data.newPassword,
    });
  }
  generateSecureCode() {
    const moduleName = 'secure';
    return createHash('sha256')
      .update(`${randomBytes(32).toString('base64url')}`)
      .update(moduleName)
      .digest('base64url')
      .slice(0, 32);
  }
  async invokeCode(
    type: 'forget' | 'update',
    email: string,
    code: string,
    expire = 60 * 1000 * 10,
  ) {
    const multi = this.redis.multi();
    multi.set(`SECURE::${type}::${email}`, code);
    multi.pexpire(`SECURE::${type}::${email}`, expire);
    await multi.exec();
    return code;
  }
  getCode(type: 'forget' | 'update', email: string) {
    return this.redis.get(`SECURE::${type}::${email}`);
  }
  async sendCode(email: string, type: 'forget' | 'update') {
    const account = (await this.account.findAccountByEmail(email)) as
      | (Account & { profile?: Profile })
      | null;
    if (!account || !account.profile) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
    const rawExpire =
      type === 'forget'
        ? this.config.get('cache.ttl.secure.mailCode.forget')
        : this.config.get('cache.ttl.secure.mailCode.update');
    const expire = rawExpire ?? 60 * 10 * 1000;
    const code = this.generateSecureCode();
    const expireStr = Number.parseInt(String((expire / 60) * 1000)).toString();
    const template =
      type === 'forget'
        ? FORGET_PASSWORD(account.profile.nick, code, expireStr)
        : UPDATE_PASSWORD(account.profile.nick, code, expireStr);
    this.invokeCode(type, email, code, expire)
      .then(() => {
        return this.mail.send({
          to: email,
          subject: `您正在执行${type === 'forget' ? '忘记密码' : '修改密码'}操作`,
          html: template,
        });
      })
      .then((ok) => {
        return ok;
      });
  }
}
