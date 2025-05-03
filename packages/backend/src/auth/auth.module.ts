import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '@app/prisma';

@Module({
  imports: [
    // MailerModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory(config: ConfigService) {
    //     return {
    //       transport: config.get('email.transport'),
    //     };
    //   },
    // }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
