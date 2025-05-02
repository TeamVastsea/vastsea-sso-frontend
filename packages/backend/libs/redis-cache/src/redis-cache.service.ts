import { AutoRedis } from '@app/decorator';
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import Redis, { Cluster } from 'ioredis';
import SuperJSON from '@gaonengwww/superjson';

@Injectable()
export class RedisCacheService {
  constructor(@AutoRedis() private redis: Cluster | Redis) {}

  async put<T>(key: string, value: T, ttl: number = -1) {
    const cacheKey = createHash('sha256').update(key).digest('hex').toString();
    await this.redis.set(cacheKey, SuperJSON.stringify(value));
    await this.redis.expire(key, ttl);
    return value;
  }
  exists(key: string) {
    return this.redis.exists(key);
  }
  async get<T>(key: string): Promise<T> {
    return SuperJSON.parse<T>(await this.redis.get(key));
  }
  remove(key: string) {
    return this.redis.del(key);
  }
}
