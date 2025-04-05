declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    CLIENT_ID: string;
    REDIS_CLUSTER?: boolean;
    SWAGGER_TITLE?: string;
    SWAGGER_DESC?: string;
    VERSION?: string;
    COMMON_ERROR_REDIRECT: string;
    APP_NAME: string;
  }
}
