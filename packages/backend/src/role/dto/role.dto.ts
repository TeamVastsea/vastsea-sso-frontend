import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class TRole implements Role {
  @ApiProperty({ description: '角色名称' })
  name: string;
  @ApiProperty({ description: '角色数据库主键' })
  id: bigint;
  @ApiProperty({ description: '角色介绍' })
  desc: string;
  @ApiProperty({ description: '客户端id' })
  clientId: string;
  @ApiProperty({ description: '是否被删除' })
  deleted: boolean;
}

export class RoleList {
  @ApiProperty({
    isArray: true,
    type: () => TRole,
  })
  data: TRole[];
  @ApiProperty()
  total: bigint;
}
