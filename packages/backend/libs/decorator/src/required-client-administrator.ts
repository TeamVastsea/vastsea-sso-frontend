import { SetMetadata } from '@nestjs/common';
import { PermissionExpr } from './permission';

export const RequiredClientAdministratorKey = Symbol(
  'Required Client Administrator',
);
export type RequiredClientAdministratorMetaData = {
  ignoreCondition: PermissionExpr | null;
  clientIdPosition: 'query' | 'param' | 'body' | 'header';
  clientIdKey: string;
};
export const RequiredClientAdministrator = (
  ignoreCondition: PermissionExpr | null = null,
  clientIdPosition: 'query' | 'param' | 'body' | 'header' = 'query',
  clientIdKey: string = 'clientId',
) => {
  return SetMetadata(RequiredClientAdministratorKey, {
    ignoreCondition,
    clientIdKey,
    clientIdPosition,
  });
};
