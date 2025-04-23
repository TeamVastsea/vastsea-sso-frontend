import { PERMISSION_KEY } from '@app/constant';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  applyDecorators,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { z } from 'zod';

export enum Operator {
  /**
   * @description 连接两个 **表达式**. 如果其中一个是false, 那么该表达式的值就是false
   * @example
   * ```ts
   * const p = [1];
   * AND(HAS(p,1), HAS(p, 2)) // false
   * ```
   */
  AND,
  /**
   * @description 连接两个 **表达式**, 如果其中一个是true, 那么该表达式的值就是true
   * @example
   * ```ts
   * const p = [1];
   * OR(HAS(p,1), HAS(p,4)) // true
   * ```
   */
  OR,
  /**
   * @description 取反一个 **表达式**, 如果连接的表达式是true那么该表达式为false, 如果连接的表达式是false那么该表达式为true
   * @example
   * ```typescript
   * NOT(SOME([1], [1,2,3])) // -> NOT(true) -> false
   * ```
   */
  NOT,
  /**
   * @description 运算操作. 表示用户是否拥有某个权限. 一元操作符
   * @example
   * ```typescript
   * HAS(1, [1,2,3]) // true
   * ```
   */
  HAS,
  /**
   * @description 运算操作. 表示用户拥有列表中的某一个权限.
   *
   * @example
   * ```typescript
   * const userPermission = [2,3,4];
   * SOME(userPermission, [1,2,3]) // true
   * ```
   */
  SOME,

  /**
   * @description 用于判断用户是否拥有列表中所有的权限
   * @example
   * ```typescript
   * const p1 = [1];
   * EVERY(p1, [1,2,3]); // false
   * EVERY([1,2,3], [1,2,3]) /// true
   * ```
   */
  EVERY,
}

export type BinaryExpression = {
  lhs: PermissionExpr;
  op: Operator.AND | Operator.OR;
  rhs: PermissionExpr;
};
export type UnaryExpression = {
  expr: string[];
  op: Operator.SOME | Operator.EVERY;
};

export type NotExpr = {
  expr: PermissionExpr;
  op: Operator.NOT;
};
export type HasExpression = {
  expr: string;
  op: Operator.HAS;
};

export type PermissionExpr =
  | BinaryExpression
  | UnaryExpression
  | HasExpression
  | NotExpr
  | boolean;
export type PermissionArgs = string[] | PermissionExpr;

export const permissionExpr: z.ZodSchema<PermissionExpr> = z
  .lazy(() => {
    return z.union([
      z.boolean(),
      z
        .object({
          expr: permissionExpr,
          op: z.literal(Operator.NOT),
        })
        .describe('对表达式进行取反'),
      z
        .object({
          expr: z.string(),
          op: z.literal(Operator.HAS),
        })
        .describe('判断是否拥有某个权限'),
      z
        .object({
          expr: z.array(z.string()).describe('想要判定的权限列表'),
          op: z.literal(Operator.SOME),
        })
        .describe(
          '如果权限列表中某一个权限存在于用户权限中, 整个表达式返回true',
        ),
      z
        .object({
          expr: z.array(z.string()).describe('想要判定的权限列表'),
          op: z.literal(Operator.EVERY),
        })
        .describe(
          '如果权限列表中所有权限权限都存在于用户权限中, 整个表达式返回true',
        ),
      z
        .object({
          lhs: permissionExpr.describe('左侧表达式'),
          rhs: permissionExpr.describe('右侧表达式'),
          op: z.literal(Operator.OR),
        })
        .describe('对左侧表达式与右侧表达式进行逻辑或操作'),
      z
        .object({
          lhs: permissionExpr,
          rhs: permissionExpr,
          op: z.literal(Operator.AND),
        })
        .describe('对左侧表达式与右侧表达式进行逻辑与操作'),
    ]);
  })
  .describe('权限表达式');
export const permissionArgsSchema = z.array(z.string()).or(permissionExpr);

const exprToString = (expr: PermissionExpr | string[]) => {
  if (Array.isArray(expr)) {
    return expr.join(', ');
  }
  if (typeof expr === 'boolean') {
    return;
  }
  if (expr.op === Operator.AND || expr.op === Operator.OR) {
    return `${exprToString(expr.lhs)} ${expr.op === Operator.AND ? 'and' : 'or'} ${exprToString(expr.rhs)}`;
  }
  if (expr.op === Operator.HAS) {
    return `HAS(${expr.expr === '*' ? '\\*' : expr.expr})`;
  }
  if (expr.op === Operator.EVERY) {
    return `EVERY(${exprToString(expr.expr)})`;
  }
  if (expr.op === Operator.SOME) {
    return `SOME(${exprToString(expr.expr)})`;
  }
};

export const Permission = (permissions: string[] | PermissionExpr) => {
  return applyDecorators(
    ApiException(() => ForbiddenException, {
      description: `当该不满足表达式 ${exprToString(permissions)} 时, 接口会抛出403错误并在message字段中阐述错误原因`,
    }),
    SetMetadata(PERMISSION_KEY, permissions),
  );
};
