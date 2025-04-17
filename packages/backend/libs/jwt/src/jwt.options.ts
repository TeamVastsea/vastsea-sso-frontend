import { ConfigurableModuleBuilder } from '@nestjs/common';

export const JWT_KEY = Symbol('JWT');

export type JwtOptions = {
  pubKey: string;
  priKey: string;
  /**
   * @see https://github.com/panva/jose/issues/210#jws-alg
   */
  keyPairType:
    | 'Ed25519'
    | 'ES256'
    | 'ES384'
    | 'ES512'
    | 'RS256'
    | 'RS384'
    | 'RS512';
};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<JwtOptions>()
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
