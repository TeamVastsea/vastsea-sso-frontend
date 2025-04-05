import { ConfigService } from '@app/config';
import {
  CLIENT_PK__ID,
  CLIENT_INFO,
  CLIENT_NAME__ID,
  CLIENT_TOTAL,
} from '@app/constant';
import { AutoRedis } from '@app/decorator';
import { Injectable } from '@nestjs/common';
import { Client } from '@prisma/client';
import Redis, { Cluster } from 'ioredis';

@Injectable()
export class ClientCache {
  constructor(
    private config: ConfigService,
    @AutoRedis() private redis: Redis | Cluster,
  ) {}

  putClientCache(client: Client) {
    const multi = this.redis.multi();
    multi.hset(CLIENT_INFO(client.clientId), client);
    multi.set(CLIENT_PK__ID(client.id), client.clientId);
    multi.expire(
      CLIENT_INFO(client.clientId),
      this.config.get('cache.ttl.client.info'),
    );
    multi.expire(
      CLIENT_PK__ID(client.id),
      this.config.get('cache.ttl.client.info'),
    );
    return multi.exec();
  }
  getClientInfoByClientId(clientId: string) {
    return this.redis.hgetall(
      CLIENT_INFO(clientId),
    ) as unknown as Promise<Client | null>;
  }
  getClientInfoByPk(pk: bigint): Promise<Client | null> {
    return this.redis
      .get(CLIENT_PK__ID(pk))
      .then((clientID) =>
        !clientID
          ? null
          : (this.redis.hgetall(
              CLIENT_INFO(clientID),
            ) as unknown as Promise<Client>),
      );
  }

  removeClientInfo(client: Client) {
    return this.redis.del(
      CLIENT_INFO(client.clientId),
      CLIENT_PK__ID(client.id),
    );
  }

  clientExistByPk(pk: bigint) {
    return this.redis.exists(CLIENT_PK__ID(pk));
  }
  clientExists(id: string) {
    return this.redis.exists(CLIENT_INFO(id));
  }
  clientExsistByName(name: string) {
    return this.redis.exists(CLIENT_NAME__ID(name));
  }
  incrClientCount() {
    return this.redis.incr(CLIENT_TOTAL());
  }
  decrClientCount() {
    return this.redis.decr(CLIENT_TOTAL());
  }
  getClientCount() {
    return this.redis.get(CLIENT_TOTAL()).then(Number.parseInt);
  }
}
