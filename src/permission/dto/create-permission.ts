import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createPermission = z.object({
  name: z.string().describe('权限id, 通常是 xxx::xxx').min(1),
  desc: z
    .string()
    .describe('权限介绍. 一般是一组自然语言, 用于描述该权限作用')
    .min(1),
  clientId: z.string().describe(
    `
      由平台颁发的 clientId. 权限只会在该clientId下生效. 不同的 clientId 之间即便有相同的 permission-name 也不会产生错误.
      例如:
      client-a 中 存在 test::permission
      client-b 可以继续创建 test::permission
      但是如果在 client-a 中继续创建 test::permission 则会抛出 409 错误. 
      `,
  ),
  active: z.boolean().default(true).describe('是否启用该权限'),
});

export class CreatePermission extends createZodDto(createPermission) {}
