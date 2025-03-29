import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createPermission = z.object({
  name: z.string().describe('Permission id. Usually xxx::xxx'),
  desc: z.string().describe('Permission description. Aka. Permission title'),
  clientId: z.string().optional(),
});

export class CreatePermission extends createZodDto(createPermission) {}
