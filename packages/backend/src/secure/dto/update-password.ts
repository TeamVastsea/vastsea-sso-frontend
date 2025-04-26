import { createZodDto } from 'nestjs-zod';
import { forgetPassword } from './forget-password';
import { z } from 'zod';

export class UpdatePassword extends createZodDto(
  forgetPassword.merge(z.object({ oldPassword: z.string() })),
) {}
