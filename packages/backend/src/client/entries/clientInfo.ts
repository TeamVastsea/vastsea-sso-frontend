import { ApiProperty } from '@nestjs/swagger';
import { Client as IClient, Profile } from '@prisma/client';

export class ClientManagerProfile implements Profile {
  @ApiProperty({ description: '个人信息uuid' })
  id: string;
  @ApiProperty({ description: '个人介绍' })
  desc: string | null;
  @ApiProperty({ description: '头像' })
  avatar: string | null;
  @ApiProperty({ description: '昵称' })
  nick: string;
  @ApiProperty({ description: '账号id' })
  accountId: bigint;
}
export class ClientManager {
  id: bigint;
  email: string;
  profile: ClientManagerProfile;
}
export class Client implements IClient {
  @ApiProperty({ description: '第三方客户端名称' })
  name: string;
  @ApiProperty({ description: '第三方客户端数据库主键' })
  id: bigint;
  @ApiProperty({ description: '第三方客户端介绍' })
  desc: string;
  @ApiProperty({ description: '第三方客户端Icon' })
  avatar: string;
  @ApiProperty({ description: '第三方客户端ClientId' })
  clientId: string;
  @ApiProperty({ description: '第三方客户端ClientSecret' })
  clientSecret: string;
  @ApiProperty({ description: '第三方客户端登陆时重定向URL' })
  redirect: string;
  @ApiProperty({ description: '第三方客户端是否被停用' })
  active: boolean;
}
export class ClientInfo extends Client {
  @ApiProperty({
    description: '第三方客户端管理员公开个人信息',
    isArray: true,
    type: () => ClientManagerProfile,
  })
  administrator: ClientManagerProfile[];
}
export class ClientList {
  @ApiProperty({ description: '客户端列表总数' })
  total: number;
  @ApiProperty({
    description: '当前页的客户端',
    isArray: true,
    type: () => ClientInfo,
  })
  datas: ClientInfo[];
}
