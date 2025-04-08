import { createZodDto } from 'nestjs-zod';
import { createRole } from './create-role.dto';
import { z } from 'zod';

export class UpdateRole extends createZodDto(
  createRole.partial().merge(z.object({ active: z.boolean().optional() })),
) {}
