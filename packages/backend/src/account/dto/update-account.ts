import { createZodDto } from 'nestjs-zod';
import { createAccount } from './create-account';
import { z } from 'zod';

export class UpdateAccount extends createZodDto(
  createAccount.partial().merge(z.object({ active: z.boolean() }).partial()),
) {}
