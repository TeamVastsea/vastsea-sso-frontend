import { ApiProperty } from '@nestjs/swagger';
import { Permission as IPermission } from '@prisma/client';

export class PermissionEntry implements IPermission {
  @ApiProperty({ description: '数据库自增ID' })
  id: bigint;
  @ApiProperty({ description: '权限Key' })
  name: string;
  @ApiProperty({ description: '权限描述' })
  desc: string;
  @ApiProperty({ description: '客户端ID' })
  clientId: string;
  @ApiProperty({ description: '客户端数据库自增主键' })
  clientPK: bigint;
  @ApiProperty({ description: '当前权限是否被停用' })
  active: boolean;
}

export class PermissionList {
  @ApiProperty({ description: '总条数' })
  total: number;
  @ApiProperty({
    description: '实际数据',
    isArray: true,
    type: () => PermissionEntry,
  })
  data: PermissionEntry[];
}
