import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createClient = z.object({
  name: z.string().max(50),
  desc: z.string().max(100),
  avatar: z.string().optional(),
  redirect: z.string().min(1),
});

export class CreateClient extends createZodDto(createClient) {}
