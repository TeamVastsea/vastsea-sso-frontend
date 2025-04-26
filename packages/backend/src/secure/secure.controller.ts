import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SecureService } from './secure.service';
import { ForgetPassword } from './dto/forget-password';
import { UpdatePassword } from './dto/update-password';
import { ConfigService } from '@app/config';
import { Account, Auth } from '@app/decorator';
import { AccountService } from '../account/account.service';

@Controller('secure')
export class SecureController {
  constructor(
    private readonly accountService: AccountService,
    private readonly secureService: SecureService,
  ) {}

  @Post('/password/forget-mail-code')
  async sendForgetPasswordMailCode(@Query('email') email: string) {
    return this.secureService.sendCode(email, 'forget');
  }

  @Patch('/password/forget')
  async forgetPassword(@Body() body: ForgetPassword) {
    return this.secureService
      .forgetPassword(body)
      .then(() => this.secureService.revokeCode('forget', body.email))
      .then(() => {});
  }

  @Auth()
  @Patch('/password')
  async updatePassword(
    @Body() body: UpdatePassword,
    @Account('id') id: string,
  ) {
    const account = await this.accountService.getAccountInfo(BigInt(id));
    if (!account) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    return this.secureService.updatePassword(body, BigInt(id)).then(() => {});
  }
}
