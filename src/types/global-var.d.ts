declare const BASE_URL: string;
declare const MOBILE_WIDTH: number;
declare const __AUTH_SERVER__: string;
declare const __GT_ID__: string;
declare module '@opentiny/vue-renderless/common/deps/infinite-scroll';

declare namespace NodeJS {
  interface ProcessEnv {
    BASE_URL: string;
    AUTH_SERVER_CLIENT_ID: string;
  }
}
