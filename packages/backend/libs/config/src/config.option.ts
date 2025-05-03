import { ConfigurableModuleBuilder } from '@nestjs/common';

type Keys<T> = keyof T;
type Values<T> = T[Keys<T>];

export type ConfigTemplate<
  T = Configure,
  A = {
    [key in keyof T]: T[key];
  },
  B = {
    [key in keyof A]: A[key] extends object | Array<unknown>
      ?
          | `${Extract<key, string>}.${Exclude<
              Extract<keyof A[key], string>,
              keyof any[]
            >}`
          | (ConfigTemplate<A[key]> extends infer R
              ? `${Extract<key, string>}.${Extract<R, string>}`
              : never)
      : key;
  },
> = Exclude<keyof A, keyof any[]> | Values<B>;

type GetTypeByTemplate<
  K extends string,
  obj = Configure,
> = K extends `${infer L}.${infer R}`
  ? L extends keyof obj
    ? GetTypeByTemplate<R, obj[L]>
    : never
  : K extends keyof obj
    ? obj[K]
    : never;
export default GetTypeByTemplate;

export type ConfigLoader = () => Configure;

export type ConfigOptions = {
  loader: ConfigLoader;
};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigOptions>()
    .setClassMethodName('forRoot')
    .setExtras(
      {
        global: false,
      },
      (def, extra) => {
        return {
          ...def,
          global: extra.global,
        };
      },
    )
    .build();
