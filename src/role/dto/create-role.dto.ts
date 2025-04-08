import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createRole = z.object({
  clientId: z.string().describe('平台颁发的clientId'),
  parent: z
    .array(z.bigint({ coerce: true }))
    .max(10)
    .default([])
    .optional()
    .describe('继承的父级'),
  desc: z.string().describe('角色的介绍'),
  name: z.string().describe('角色的名称'),
  permissions: z
    .array(z.bigint({ coerce: true }))
    .default([])
    .describe('角色的权限'),
});

export class CreateRole extends createZodDto(createRole) {}
