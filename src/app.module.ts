import { JwtModule } from '@app/jwt';
import { PrismaModule } from '@app/prisma';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    PrismaModule,
    JwtModule.forRoot({global: true})
  ],
})
export class AppModule {}
