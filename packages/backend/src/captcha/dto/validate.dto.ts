import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const validate = z.object({
  lot_number: z.string().min(1),
  captcha_output: z.string().min(1),
  pass_token: z.string().min(1),
  gen_time: z.string().min(1),
});

export class ValidateDto extends createZodDto(validate) {}
