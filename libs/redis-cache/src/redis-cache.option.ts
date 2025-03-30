import { ConfigurableModuleBuilder } from '@nestjs/common';

export const { ConfigurableModuleClass } = new ConfigurableModuleBuilder()
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
