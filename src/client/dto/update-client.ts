import { createZodDto } from 'nestjs-zod';
import { createClient } from './create-client';

export class UpdateClient extends createZodDto(createClient.partial()) {}
