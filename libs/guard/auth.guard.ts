import { AutoRedis } from '@app/decorator';
import { AuthKey } from '@app/decorator/auth';
import { JwtService } from '@app/jwt';
import { errors } from '@gaonengwww/jose';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import Redis, { Cluster } from 'ioredis';
import { AuthService } from '../../src/auth/auth.service';
import { PermissionService } from '../../src/permission/permission.service';

export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwt: JwtService,
    private auth: AuthService,
    private permissions: PermissionService,
    @AutoRedis() private redis: Redis | Cluster,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredToken = this.reflector.getAllAndOverride(AuthKey, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredToken) {
      return true;
    }
    const http = context.switchToHttp();
    const req = http.getRequest();
    const token = this.getToken(req);
    if (!token) {
      throw new HttpException('未登录', HttpStatus.UNAUTHORIZED);
    }
    const msg = this.jwt.verify(token).catch((err) => {
      if (err instanceof errors.JWTExpired) {
        return 'Token过期';
      }
      return 'Token 不合法';
    });
    if (await msg) {
      throw new HttpException(await msg, HttpStatus.UNAUTHORIZED);
    }
    const { id } = this.jwt.decode<AccessTokenPayload>(token);
    const activeState = this.auth
      .active(BigInt(id), process.env.CLIENT_ID)
      .then(Boolean);
    if (!(await activeState)) {
      throw new HttpException('未登录', HttpStatus.BAD_REQUEST);
    }
    req.user = { id };
    return true;
  }
  getToken(req: Request) {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
