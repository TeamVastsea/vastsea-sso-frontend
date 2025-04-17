import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const refreshToken = z.object({
  refreshToken: z.string().describe('刷新令牌'),
});

export class RefreshToken extends createZodDto(refreshToken) {}
