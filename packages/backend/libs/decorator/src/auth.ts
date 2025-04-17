import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  applyDecorators,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export const AuthKey = Symbol('Auth');
export const Auth = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiException(() => UnauthorizedException, {
      description:
        '该接口需要携带Token请求, 如果未携带Token或Token过期, 接口将会阻止本次请求, 抛出401错误. Message字段阐述了失败原因',
    }),
    SetMetadata(AuthKey, true),
  );
};
