import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Client } from '@prisma/client';

export class TClient implements Client {
  @ApiProperty({ description: '自然语言, 可重复的' })
  name: string;
  @ApiProperty({ description: '全局绝对唯一' })
  id: bigint;
  @ApiProperty({})
  desc: string;
  @ApiProperty({})
  avatar: string;
  @ApiProperty({
    description:
      '暴露给用户. 在登陆时需要携带clientId, 后端管理不会使用 `clientId`',
  })
  clientId: string;
  @ApiProperty({
    description: '敏感数据, 通常不会暴露给用户. 但是可以暴露给管理员',
  })
  clientSecret: string;
  @ApiProperty({
    description: '获取code后会携带code重定向到该地址',
  })
  redirect: string;
}

@ApiSchema({ name: 'ClientList' })
export class ClientList {
  @ApiProperty({
    description: '当前筛选条件下共有多少数据',
  })
  total: number;
  @ApiProperty({
    isArray: true,
    description: '数据列表',
    type: () => TClient,
  })
  data: TClient[];
}
