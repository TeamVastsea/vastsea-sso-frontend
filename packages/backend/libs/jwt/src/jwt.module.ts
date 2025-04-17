import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { ConfigurableModuleClass } from './jwt.options';

@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule extends ConfigurableModuleClass {}
