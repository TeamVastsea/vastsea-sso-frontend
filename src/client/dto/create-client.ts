import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createClient = z.object({
  name: z
    .string()
    .max(50)
    .describe('Client 的人类可识别名称. 最长不超过50字符'),
  desc: z
    .string()
    .max(100)
    .default('')
    .describe('Client 的人类可识别介绍. 最长不超过100字符'),
  avatar: z.string().optional().describe('Client 的Logo'),
  redirect: z.string().min(1).describe('获取Code后跳转到哪'),
  administrator: z
    .array(z.bigint({ coerce: true }))
    .optional()
    .describe('该客户端的管理员, 如果不指派则默认为创建者'),
});

export class CreateClient extends createZodDto(createClient) {}
