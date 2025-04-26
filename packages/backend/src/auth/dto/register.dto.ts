import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const registerDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  code: z.string(),
  profile: z.object({
    nick: z.string(),
    desc: z.string(),
  }),
  usa: z
    .boolean()
    .describe('是否同意了用户服务条款 user service agreement (缩写为 usa)'),
});

export class RegisterDto extends createZodDto(registerDto) {}
