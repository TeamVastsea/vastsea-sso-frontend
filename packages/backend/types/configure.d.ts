import {
  ClusterClientOptions,
  RedisClientOptions,
} from '@liaoliaots/nestjs-redis';

declare global {
  type Configure = {
    redis: {
      cluster?: ClusterClientOptions | ClusterClientOptions[];
      standalone?: RedisClientOptions | RedisClientOptions[];
    };
    email: {
      email: string;
      transport: {
        host: string;
        port: number;
        auth: {
          user: string;
          pass: string;
        };
      };
    };
    client: {
      idLen: number;
      secretLen: number;
    };
    file: {
      avatar: {
        profile: {
          path: string;
        };
        client: {
          path: string;
        };
      };
    };
    cache: {
      ttl: {
        role: {
          list: number;
          info: number;
          tree: number;
        };
        client: {
          secret: number;
          info: number;
          list: number;
        };
        auth: {
          code: number;
          token: {
            access: number;
            refresh: number;
          };
          emailCode: number;
        };
        secure: {
          mailCode: {
            forget: number;
            update: number;
          };
        };
      };
    };
  };
}
