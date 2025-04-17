import { createZodDto } from 'nestjs-zod';
import { createPermission } from './create-permission';

export class UpdatePermission extends createZodDto(
  createPermission.partial(),
) {}
