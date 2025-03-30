import { PERMISSION_KEY } from '@app/constant';
import { SetMetadata } from '@nestjs/common';

export const Permission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
