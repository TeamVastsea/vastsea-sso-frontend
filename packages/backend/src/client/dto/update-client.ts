import { createZodDto } from 'nestjs-zod';
import { createClient } from './create-client';
import { z } from 'zod';

export class UpdateClient extends createZodDto(
  createClient.partial().merge(z.object({ active: z.boolean().optional() })),
) {}
