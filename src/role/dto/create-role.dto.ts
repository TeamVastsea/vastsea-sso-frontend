import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createRole = z.object({
  clientId: z.string(),
  parent: z
    .array(z.bigint({ coerce: true }))
    .max(10)
    .optional(),
  desc: z.string(),
  name: z.string(),
  permissions: z.array(z.bigint({ coerce: true })),
});

export class CreateRole extends createZodDto(createRole) {}
