import { Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { ConfigurableModuleClass } from './redis-cache.option';

@Module({
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule extends ConfigurableModuleClass {
  constructor() {
    super();
  }
}
