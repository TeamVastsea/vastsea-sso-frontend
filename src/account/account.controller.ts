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
import { CreateAccount } from './dto/create-account';
import {
  Auth,
  BigIntPipe,
  Operator,
  Permission,
  PermissionJudge,
  RequireClientPair,
} from '@app/decorator';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AccountOnline } from './dto/account-online-body';
import { UpdateAccount } from './dto/update-account';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @Post('mail-code')
  async getMailCode(@Query('email') email: string) {
    return {
      ttl: await this.accountService.createEmailCode(email),
    };
  }

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
      await this.accountService.verifyCode(body.email, body.code, emailCode);
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
  @Permission(['ACCOUNT::REMOVE'])
  @Patch(':id')
  updateAccount(
    @Param('id', BigIntPipe) id: bigint,
    @Body() body: UpdateAccount,
  ) {
    return this.accountService.updateAccount(id, body);
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
  async getAccountInfo(@Param('id', BigIntPipe) id: bigint) {
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
