import { Injectable } from '@nestjs/common';
import * as jose from '@gaonengwww/jose';

@Injectable()
export class JwtService {
  constructor(){}

  decode<T>(token:string):T{
    return jose.decodeJwt(token)
  }
  verify(token: string, secret: string, alg: string='RS256'){
    return jose.jwtVerify(token, new TextEncoder().encode(secret), {algorithms: [alg]})
  }

  sign(
    payload:jose.JWTPayload,
    secret: string,
    type: 'access' | 'refresh',
    expire: number | string,
    alg: string = 'RS256',
    issuer: string,
  ){
    return new jose.SignJWT({
      ...payload,
      type
    })
    .setExpirationTime(expire)
    .setProtectedHeader({alg})
    .setIssuer(issuer)
    .sign(
      new TextEncoder().encode(secret)
    )
  }
}
