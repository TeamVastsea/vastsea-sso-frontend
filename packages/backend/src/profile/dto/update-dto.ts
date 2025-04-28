import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateProfile = z.object({
  nick: z.string(),
  desc: z.string().optional().nullable(),
});

export class UpdateProfile extends createZodDto(updateProfile.partial()) {}
