import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createAccount = z.object({
  email: z.string().describe('邮箱'),
  code: z.string().describe('邮箱验证码').optional(),
  password: z.string().describe('登陆密码'),
  profile: z.object({
    nick: z.string().describe('昵称'),
    desc: z.string().optional().describe('个人简介'),
    avatar: z.string().optional().describe('头像'),
  }),
  role: z.array(z.bigint({ coerce: true })).optional(),
});

export class CreateAccount extends createZodDto(createAccount) {}
