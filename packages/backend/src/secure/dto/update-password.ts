import { createZodDto } from 'nestjs-zod';
import { forgetPassword } from './forget-password';
import { z } from 'zod';

const updatePassword = forgetPassword.merge(
  z.object({
    oldPassword: z.string(),
    email: z.undefined(),
    code: z.undefined(),
  }),
);

export class UpdatePassword extends createZodDto(updatePassword) {}
