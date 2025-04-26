import { Module } from '@nestjs/common';
import { SecureService } from './secure.service';
import { SecureController } from './secure.controller';
import { AuthModule } from '../auth/auth.module';
import { AccountModule } from '../account/account.module';
import { MailModule } from '@app/mail';

@Module({
  controllers: [SecureController],
  providers: [SecureService],
  imports: [AuthModule, AccountModule, MailModule],
})
export class SecureModule {}
