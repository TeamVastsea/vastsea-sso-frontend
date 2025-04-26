import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const forgetPassword = z.object({
  email: z.string(),
  code: z.string(),
  newPassword: z.string(),
});

export class ForgetPassword extends createZodDto(forgetPassword) {}
