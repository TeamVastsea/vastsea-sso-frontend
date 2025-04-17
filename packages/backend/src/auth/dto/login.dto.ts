import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const login = z.object({
  email: z.string().describe('用户注册邮箱'),
  password: z.string().describe('用户注册时填写的密码'),
});

export class LoginDto extends createZodDto(login) {}
