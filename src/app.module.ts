import { JwtModule } from '@app/jwt';
import { PrismaModule } from '@app/prisma';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { PermissionModule } from './permission/permission.module';
import { ClusterModule, RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService, tomlLoader } from '@app/config';
import { join } from 'path';
import { GlobalCounterModule } from '@app/global-counter';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RoleModule } from './role/role.module';
import { RedisCacheModule } from '@app/redis-cache';
import { AuthModule } from './auth/auth.module';
import { readFileSync } from 'fs';

@Module({
  imports: [
    PrismaModule,
    JwtModule.forRoot({
      global: true,
      priKey: readFileSync(join(__dirname, 'keys/pri.pkcs8')).toString(),
      pubKey: readFileSync(join(__dirname, 'keys/pub.pem')).toString(),
      keyPairType: 'RS256',
    }),
    PermissionModule,
    ConfigModule.forRoot({
      loader: tomlLoader(join(__dirname, '../config.toml')),
      global: true,
    }),
    process.env.REDIS_CLUSTER
      ? ClusterModule.forRootAsync(
          {
            inject: [ConfigService],
            useFactory(config: ConfigService) {
              return {
                config: config.get('redis.cluster'),
              };
            },
          },
          true,
        )
      : RedisModule.forRootAsync(
          {
            inject: [ConfigService],
            useFactory(config: ConfigService) {
              return {
                config: config.get('redis.standalone'),
              };
            },
          },
          true,
        ),
    GlobalCounterModule.forRoot({ global: true }),
    RedisCacheModule.forRoot({ global: true }),
    RoleModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
