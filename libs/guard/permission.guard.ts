import { PERMISSION_KEY } from '@app/constant';
import { Operator, PermissionArgs, PermissionExpr } from '@app/decorator';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../../src/permission/permission.service';

export class PermissionGuard implements CanActivate {
  constructor(
    @Inject() private readonly reflector: Reflector,
    private readonly permission: PermissionService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions: PermissionArgs =
      this.reflector.getAllAndOverride(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    if (!requiredPermissions) {
      return true;
    }
    if (Array.isArray(requiredPermissions) && !requiredPermissions.length) {
      return true;
    }
    const req: AuthReq = context.switchToHttp().getRequest();
    const {
      user: { id },
    } = req;
    const permissions = await this.permission.getAccountPermission(
      BigInt(id),
      process.env.CLIENT_ID,
    );
    if (permissions.includes('*')) {
      return true;
    }
    if (
      Array.isArray(requiredPermissions) &&
      requiredPermissions.length > permissions.length
    ) {
      throw new HttpException(`权限不足`, HttpStatus.FORBIDDEN);
    }
    if (
      Array.isArray(requiredPermissions) &&
      requiredPermissions.every((permission) =>
        permissions.includes(permission),
      )
    ) {
      return true;
    }
    if (
      !Array.isArray(requiredPermissions) &&
      this.judge(permissions, requiredPermissions)
    ) {
      return true;
    }
    throw new HttpException('权限不足', HttpStatus.FORBIDDEN);
  }
  judge(userPermission: string[], node: PermissionExpr) {
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
      return !this.judge(userPermission, node.expr);
    }
    if (node.op === Operator.AND || node.op === Operator.OR) {
      const lval =
        typeof node.lhs === 'object'
          ? this.judge(userPermission, node.lhs)
          : node.lhs;
      const rval =
        typeof node.rhs === 'object'
          ? this.judge(userPermission, node.rhs)
          : node.rhs;
      if (node.op === Operator.AND) {
        return lval && rval;
      }
      if (node.op === Operator.OR) {
        return lval || rval;
      }
    }
  }
}
