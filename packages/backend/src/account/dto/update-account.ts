import { createZodDto } from 'nestjs-zod';
import { createAccount } from './create-account';
import { z } from 'zod';

export const updateAccount = z.object({
  email: z.string().describe('邮箱'),
  password: z.string().describe('密码'),
  profile: z
    .object({
      nick: z.string().describe('昵称'),
      desc: z.string().describe('个人简介'),
      avatar: z.string().describe('头像'),
    })
    .partial(),
});

export class UpdateAccount extends createZodDto(createAccount.partial()) {}
