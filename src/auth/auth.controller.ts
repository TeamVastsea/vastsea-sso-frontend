import {
  Controller,
  Post,
  Body,
  Res,
  Query,
  Get,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TokenPayload } from './dto/token-pair.dto';
import { RefreshToken } from './dto/refresh-token';
import { JwtService } from '@app/jwt';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { errors } from '@gaonengwww/jose';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({
    description: `
    该接口作为登录使用. 最终会被重定向到两个地方
    1. 如果客户端不存在, 那么将会重定向到 rediect query 指定的位置
    2. 如果客户端不存在, 且redirect没有指定, 那么将会跳转到本项目设置的 process.env.COMMON_ERROR_REDIRECT 位置
    `,
  })
  @ApiQuery({
    name: 'redirect',
    description: '如果传入了该参数, 失败时会重定向于此. 成功时不会',
    required: false,
  })
  @ApiQuery({
    name: 'clientId',
    description: '注册时, 平台颁发的clientId',
    required: false,
  })
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Query('redirect') redirect: string,
    @Query('clientId') clientId: string,
    @Res() res: Response,
  ) {
    const { ok, reason, code, client } =
      await this.authService.generateAuthCode(
        body.email,
        body.password,
        clientId,
      );
    const url = new URL(
      (client ? client.redirect : null) ??
        redirect ??
        process.env.COMMON_ERROR_REDIRECT,
    );
    if (!ok) {
      url.searchParams.append('ok', 'false');
      url.searchParams.append('reason', reason);
      res.redirect(url.toString());
      return;
    }
    url.searchParams.append('ok', 'true');
    url.searchParams.append('code', code);
    res.redirect(url.toString());
  }
  @ApiQuery({ name: 'code', description: '从 /login 获取到的授权码' })
  @ApiQuery({ name: 'clientId', description: '注册时平台颁发的clientId' })
  @ApiQuery({
    name: 'clientSecret',
    description: '注册时平台颁发的clientSecret',
  })
  @ApiOkResponse({
    type: TokenPayload,
    description:
      '返回的是一个json对象,该对象将会阐明AccessToken,RefreshToken以及两个令牌的过期时间.',
  })
  @Get('/token')
  token(
    @Query('code') code: string,
    @Query('clientId') clientId: string,
    @Query('clientSecret') clientSecret: string,
  ): Promise<TokenPayload> {
    return this.authService.generateToken(code, clientId, clientSecret);
  }

  @ApiQuery({ name: 'clientId', description: '平台注册时颁发的clientId' })
  @ApiQuery({
    name: 'clientSecret',
    description: '平台注册时颁发的clientSecret',
  })
  @ApiOkResponse({ description: '返回一组新的密钥对', type: TokenPayload })
  @ApiException(() => BadRequestException, {
    description: '参数错误, message字段是一个自然语言, 阐述了失败的原因',
  })
  @Post('/refresh')
  refreshToken(
    @Body() body: RefreshToken,
    @Query('clientId') clientId: string,
    @Query('clientSecret') clientSecret: string,
  ) {
    const { refreshToken } = body;
    try {
      const userId = this.jwtService.decode<{ id: string }>(
        body.refreshToken,
      ).id;
      return this.authService.refreshToken(
        userId,
        refreshToken,
        clientId,
        clientSecret,
      );
    } catch (e) {
      if (e instanceof errors.JWTInvalid) {
        throw new HttpException('刷新令牌不合法', HttpStatus.BAD_REQUEST);
      }
    }
  }
}
