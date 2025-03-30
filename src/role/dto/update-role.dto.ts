import { createZodDto } from 'nestjs-zod';
import { createRole } from './create-role.dto';

export class UpdateRole extends createZodDto(createRole.partial()) {}
