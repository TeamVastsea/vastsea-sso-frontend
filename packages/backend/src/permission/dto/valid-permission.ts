import { permissionArgsSchema } from '@app/decorator';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const validPermission = z.object({
  expr: permissionArgsSchema,
});

export class JudgePermission extends createZodDto(validPermission) {}
