import { AutoRedis } from '@app/decorator';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Redis, { Cluster } from 'ioredis';

@Injectable()
export class GlobalCounterService {
  constructor(@AutoRedis() private redis: Redis | Cluster) {}

  exists(name: string) {
    return this.redis.exists(`counter::${name}`);
  }

  async register(name: string, start: number, step: number) {
    const counterExists = await this.redis.exists(name);
    if (counterExists) {
      throw new HttpException(`${name} 已存在`, HttpStatus.BAD_REQUEST);
    }
    await this.redis.hset(`${name}::meta`, { start, step });
    await this.redis.incrby(`counter::${name}`, start);
  }
  async decr(name: string) {
    const counterExists = await this.redis.exists(name);
    if (!counterExists) {
      throw new HttpException(`${name} 不存在`, HttpStatus.NOT_FOUND);
    }
    const step =
      Number.parseInt(await this.redis.hget(`${name}::meta`, 'step')) * -1;
    const newVal =
      BigInt(await this.redis.get(`counter::${name}`)) + BigInt(step);
    await this.redis.set(`counter::${name}`, newVal.toString());
    return newVal;
  }
  async incr(name: string) {
    const counterExists = await this.redis.exists(name);
    if (!counterExists) {
      throw new HttpException(`${name} 不存在`, HttpStatus.NOT_FOUND);
    }
    const step = Number.parseInt(
      await this.redis.hget(`${name}::meta`, 'step'),
    );
    const newVal =
      BigInt(await this.redis.get(`counter::${name}`)) + BigInt(step);
    await this.redis.set(`counter::${name}`, newVal.toString());
    return newVal;
  }
}
