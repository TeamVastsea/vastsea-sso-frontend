import { ConfigurableModuleBuilder } from "@nestjs/common";

export const JWT_KEY = Symbol('JWT');

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder()
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