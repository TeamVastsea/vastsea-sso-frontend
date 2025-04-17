import { createParamDecorator } from '@nestjs/common';
import { PermissionExpr, Operator } from '@app/decorator';

export const permissionJudge = (
  userPermission: string[],
  node: PermissionExpr,
) => {
  if (typeof node === 'boolean') {
    return node;
  }
  if (node.op === Operator.HAS) {
    return userPermission.includes(node.expr);
  }
  if (node.op === Operator.SOME) {
    const required = node.expr;
    return userPermission.some((p) => required.includes(p));
  }
  if (node.op === Operator.EVERY) {
    const required = node.expr;
    return userPermission.every((p) => required.includes(p));
  }
  if (node.op === Operator.NOT) {
    return !permissionJudge(userPermission, node.expr);
  }
  if (node.op === Operator.AND || node.op === Operator.OR) {
    const lval =
      typeof node.lhs === 'object'
        ? permissionJudge(userPermission, node.lhs)
        : node.lhs;
    const rval =
      typeof node.rhs === 'object'
        ? permissionJudge(userPermission, node.rhs)
        : node.rhs;
    if (node.op === Operator.AND) {
      return lval && rval;
    }
    if (node.op === Operator.OR) {
      return lval || rval;
    }
  }
};

export const PermissionJudge = createParamDecorator(
  (expr: PermissionExpr, context) => {
    const http = context.switchToHttp();
    const req = http.getRequest();
    return permissionJudge(req.user?.permissions ?? [], expr);
  },
);
