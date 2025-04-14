import { createParamDecorator } from '@nestjs/common';
import { PermissionExpr } from './permission';
import { permissionJudge } from '@app/guard';

export const PermissionJudge = createParamDecorator(
  (expr: PermissionExpr, context) => {
    const http = context.switchToHttp();
    const req = http.getRequest();
    return permissionJudge(req.user.permissions, expr);
  },
);
