import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const refreshToken = z.object({
  refreshToken: z.string().describe('刷新令牌'),
  userId: z.string().optional().describe('用户ID, 如果留空则从令牌中获取'),
});

export class RefreshToken extends createZodDto(refreshToken) {}
