import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Query,
  Res,
  Delete,
  HttpCode,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { ClientService } from '../client/client.service';
import { RefreshToken } from './dto/refresh-token';
import { JwtService } from '@app/jwt';
import { PermissionService } from '../permission/permission.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly client: ClientService,
    private readonly permission: PermissionService,
    private readonly jwt: JwtService,
  ) {}

  @Post('/login')
  async login(@Body() body: LoginDto) {
    const loginHandle = await this.authService.login(body);
    if (loginHandle.ok === false) {
      throw new HttpException(loginHandle.reason, HttpStatus.BAD_REQUEST);
    }
    const permission = await this.permission.getAccountPermission(
      loginHandle.id,
      process.env.CLIENT_ID,
    );
    if (
      !permission.includes('*') &&
      !permission.includes('AUTH-SERVER::LOGIN')
    ) {
      throw new HttpException('权限不足', HttpStatus.FORBIDDEN);
    }
    const tokenPayload = await this.authService.createTokenPair(
      loginHandle.id.toString(),
    );
    await this.authService.invokeTokenPair(loginHandle.id, tokenPayload);
    return tokenPayload;
  }

  @Post('/session')
  async getCodeBySession(
    @Query('clientId') clientId: string,
    @Req() req: Request,
  ) {
    const client = await this.client.findClient({ clientId });
    if (!client) {
      throw new HttpException('客户端不存在', HttpStatus.BAD_REQUEST);
    }
    const cookie = req.cookies?.['session-state'];
    if (!cookie) {
      throw new HttpException('session-state 不合法', HttpStatus.BAD_REQUEST);
    }
    const codeHandle = await this.authService.getCodeBySession(cookie);
    if (codeHandle.ok === false) {
      throw new HttpException(codeHandle.reason, codeHandle.state);
    }
    return { code: codeHandle.code };
  }

  @Post('/code')
  @HttpCode(HttpStatus.FOUND)
  async createCode(
    @Body() body: LoginDto,
    @Query('clientId') clientId: string,
    @Query('state') state: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const client = await this.client.findClient({ clientId });
    if (!client) {
      const url = new URL(process.env.COMMON_ERROR_REDIRECT);
      url.searchParams.append('ok', 'false');
      url.searchParams.append('reason', '客户端不存在');
      res.redirect(url.toString());
      return;
    }
    const url = new URL(client?.redirect ?? process.env.COMMON_ERROR_REDIRECT);
    const loginHandle = await this.authService.login(body);
    if (loginHandle.ok === false) {
      url.searchParams.append('ok', `${loginHandle.ok}`);
      url.searchParams.append('reason', loginHandle.reason);
      res.redirect(url.toString());
      return;
    }
    const code = this.authService.createCode(clientId);
    const sessionState = this.authService.createSessionState();
    await this.authService.invokeSessionState(code, clientId, sessionState);
    await this.authService.invokeCode(loginHandle.id, code);
    url.searchParams.append('ok', 'true');
    url.searchParams.append('code', code);
    url.searchParams.append('state', state);
    res.cookie('session-state', sessionState);
    res.redirect(url.toString());
    return;
  }
  @Post('/token')
  async createToken(@Query('code') code: string) {
    const userId = await this.authService.getPayloadFromCode(code);
    if (!userId) {
      throw new HttpException('校验码过期', HttpStatus.BAD_REQUEST);
    }
    const tokenPayload = this.authService.createTokenPair(userId);
    return tokenPayload.then((payload) => {
      return this.authService
        .revokeCode(code)
        .then(() => this.authService.invokeTokenPair(userId, payload))
        .then(() => payload);
    });
  }
  @Post('/token/refresh')
  async refreshToken(@Body() body: RefreshToken) {
    try {
      const { id } = this.jwt.decode<{ id: string }>(body.refreshToken);
      if (!id) {
        throw new HttpException('Token不合法', HttpStatus.BAD_REQUEST);
      }
      const tokenPair = this.authService.createTokenPair(id);
      return tokenPair.then((payload) =>
        this.authService.invokeTokenPair(id, payload).then(() => payload),
      );
    } catch {
      throw new HttpException('Token不合法', HttpStatus.BAD_REQUEST);
    }
  }
  @Delete('/session')
  async removeSession(
    @Query('code') code: string,
    @Query('clientId') clientId: string,
  ) {
    await this.authService.revokeSession(code, clientId);
  }
}
