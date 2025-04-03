import { SetMetadata } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export const AuthKey = Symbol('Auth');
export const Auth = () => {
  SetMetadata(AuthKey, true);
  return ApiBearerAuth();
};
