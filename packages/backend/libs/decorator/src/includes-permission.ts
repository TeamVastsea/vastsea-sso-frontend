import { createParamDecorator } from '@nestjs/common';
import { PermissionExpr } from './permission';
import { permissionJudge } from '../../decorator/src/permission-judge';

export const Account = createParamDecorator(
  (requiredPermission: PermissionExpr, ctx) => {
    const http = ctx.switchToHttp();
    const req = http.getRequest();
    const permissions = req.user['permission'];
    return permissionJudge(permissions, requiredPermission);
  },
);
