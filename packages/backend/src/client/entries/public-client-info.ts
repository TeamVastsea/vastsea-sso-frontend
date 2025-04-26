import { ApiProperty } from '@nestjs/swagger';

export class PublicClientInfo {
  @ApiProperty({ name: '客户端注册时颁发的clientId' })
  clientId: string;
  @ApiProperty({ name: '客户端的Icon' })
  avatar: string | null;
  @ApiProperty({ name: '客户端的自然语言名称' })
  name: string;
  @ApiProperty({ name: '客户端重定向域名' })
  redirect: string;
}
