import {
  DEFAULT_CLUSTER_NAMESPACE,
  DEFAULT_REDIS_NAMESPACE,
  InjectCluster,
  InjectRedis,
} from '@liaoliaots/nestjs-redis';
export const AutoRedis = () =>
  process.env.REDIS_CLUSTER
    ? InjectCluster(DEFAULT_CLUSTER_NAMESPACE)
    : InjectRedis(DEFAULT_REDIS_NAMESPACE);
