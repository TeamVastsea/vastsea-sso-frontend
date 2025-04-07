import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createPermission = z.object({
  name: z.string().describe('Permission id. Usually xxx::xxx').min(1),
  desc: z
    .string()
    .describe('Permission description. Aka. Permission title')
    .min(1),
  clientId: z.string(),
});

export class CreatePermission extends createZodDto(createPermission) {}
