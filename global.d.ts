declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    REDIS_CLUSTER?: boolean;
  }
}
