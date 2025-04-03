import { Body, Controller, Post, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccount } from './dto/create-account';

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
  async createAccount(@Body() body: CreateAccount) {
    return this.accountService.createAccount(body);
  }
}
