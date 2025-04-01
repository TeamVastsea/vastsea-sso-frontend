import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export class TokenExpire {
  @ApiProperty({
    description: '从颁发的那一刻起, Access Token 距离失效还有多少**毫秒**',
  })
  access: number;
  @ApiProperty({
    description: '从颁发的那一刻起, Refresh Token 距离失效还有多少**毫秒**',
  })
  refresh: number;
}

@ApiSchema()
export class TokenPayload {
  @ApiProperty({
    description: `
      服务器颁发的访问令牌. 资源服务器可以缓存该令牌, 以减轻AS的压力.
      如果资源服务器选择缓存该令牌, 那么必须设置过期时间.
      具体请参考 expire.access.
      `,
  })
  access_token: string;
  @ApiProperty({ description: '刷新Token, 仅用作刷新 access_token ' })
  refresh_token: string;
  @ApiProperty({ description: '过期时间' })
  expire: TokenExpire;
}
