import type { AxiosInstance } from 'axios';

declare interface CommonComposablesProps<M extends Record<any, any> = object> extends M {
  fetcher: AxiosInstance;
}
