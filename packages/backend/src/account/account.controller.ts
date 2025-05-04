import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccount, RegisterAccount } from './dto/create-account';
import {
  Auth,
  BigIntPipe,
  Operator,
  Permission,
  PermissionJudge,
  RequireClientPair,
  RequriedCaptcha,
} from '@app/decorator';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AccountOnline } from './dto/account-online-body';
import { UpdateAccount } from './dto/update-account';
import { z } from 'zod';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @Post('mail-code')
  async getMailCode(@Query('email') email: string) {
    const parser = z.string().email();
    return parser
      .safeParseAsync(email)
      .then((ret) => {
        if (ret.success) {
          return {
            ttl: this.accountService.createEmailCode(email),
          };
        }
        throw new HttpException('邮箱地址不合法', HttpStatus.BAD_REQUEST);
      })
      .then((data) => data.ttl)
      .then((ttl) => ({ ttl }));
  }

  @RequriedCaptcha('geetest')
  @Post('/register')
  async register(@Body() body: RegisterAccount) {
    if (!body.usa) {
      throw new HttpException(
        `如果您想要使用 ${process.env.APP_NAME} 服务. 请先同意用户使用条款.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const mailCode = await this.accountService.getEmailCode(body.email);
    await this.accountService.verifyCode(body.email, body.code, mailCode);
    return this.accountService.createAccount({
      ...body,
      role: [],
    });
  }

  @Auth()
  @Permission(['ACCOUNT::ADD'])
  @Post('')
  async createAccount(
    @Body() body: CreateAccount,
    @PermissionJudge({
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'ACCOUNT::CREATE::*' },
    })
    force: boolean,
  ) {
    if (!force) {
      const emailCode = await this.accountService.getEmailCode(body.email);
      await this.accountService.verifyCode(
        body.email,
        body.code ?? '',
        emailCode,
      );
    }
    return this.accountService.createAccount(body);
  }

  @Auth()
  @Permission(['ACCOUNT::REMOVE'])
  @Delete(':id')
  async removeAccount(@Param('id', BigIntPipe) id: bigint) {
    return this.accountService.removeAccount(id);
  }

  @Auth()
  @Permission(['ACCOUNT::UPDATE'])
  @Patch(':id')
  updateAccount(
    @Param('id', BigIntPipe) id: bigint,
    @Body() body: UpdateAccount,
  ) {
    return this.accountService
      .updateAccount(id, body)
      .then((data) => this.kick(id).then(() => data));
  }

  @Auth()
  @Permission(['ACCOUNT::KICKOUT'])
  @Post('/kick/:id')
  kick(@Param('id', BigIntPipe) id: bigint) {
    return this.accountService.kickout(id);
  }

  @Auth()
  @Permission(['ACCOUNT::QUERY::INFO'])
  @Get(':id')
  getAccountInfo(@Param('id', BigIntPipe) id: bigint) {
    const account = this.accountService.getAccountInfo(id);
    return account.then((account) => {
      if (!account) {
        throw new HttpException('账号不存在', HttpStatus.NOT_FOUND);
      }
      return account;
    });
  }

  @Auth()
  @Permission(['ACCOUNT::QUERY::LIST'])
  @Get('')
  async getAccountList(
    @Query('preId', new BigIntPipe({ optional: true })) preId: bigint,
    @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
  ) {
    return this.accountService.getAccountList(preId, size);
  }

  @ApiQuery({ name: 'id', description: '用户id' })
  @ApiOperation({
    summary: '获取用户在当前客户端下的登陆状态',
    description: '获取用户在当前客户端下的登陆状态',
  })
  @ApiOkResponse({
    type: AccountOnline,
  })
  @ApiException(() => NotFoundException, {
    description: '如果用户不存在, 则会抛出 404 错误',
  })
  @RequireClientPair()
  @Get('/online/:id')
  getAccountOnlineState(@Param('id', BigIntPipe) id: bigint) {
    return this.accountService
      .userOnline(id)
      .then((state) => ({ online: Boolean(state) }));
  }
}
