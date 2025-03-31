declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    REDIS_CLUSTER?: boolean;
    SWAGGER_TITLE?: string;
    SWAGGER_DESC?: string;
    VERSION?: string;
  }
}
