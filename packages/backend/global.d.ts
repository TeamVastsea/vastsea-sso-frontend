declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    REDIRECT: string;
    REDIS_CLUSTER?: boolean;
    SWAGGER_TITLE?: string;
    SWAGGER_DESC?: string;
    VERSION?: string;
    COMMON_ERROR_REDIRECT: string;
    APP_NAME: string;
  }
}

declare const __TEST__: boolean;
declare const __DEV__: boolean;
