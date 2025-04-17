import { Inject, Injectable } from '@nestjs/common';
import * as jose from '@gaonengwww/jose';
import { JwtOptions, MODULE_OPTIONS_TOKEN } from './jwt.options';

@Injectable()
export class JwtService {
  private pubKey: Promise<jose.CryptoKey>;
  private priKey: Promise<jose.CryptoKey>;
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private opt: JwtOptions) {
    const { pubKey, priKey, keyPairType } = opt;
    this.pubKey = jose.importSPKI(pubKey, keyPairType);
    this.priKey = jose.importPKCS8(priKey, keyPairType);
  }

  decode<T>(token: string): T {
    return jose.decodeJwt(token);
  }
  async verify(token: string) {
    return jose.jwtVerify(token, await this.pubKey);
  }

  async sign(
    payload: jose.JWTPayload,
    type: 'access' | 'refresh',
    expire: number,
    { issuer }: { issuer: string },
  ) {
    return new jose.SignJWT({
      ...payload,
      type,
    })
      .setExpirationTime(new Date(Date.now() + expire))
      .setIssuer(issuer)
      .setProtectedHeader({ alg: this.opt.keyPairType })
      .sign(await this.priKey);
  }
}
