import { INestApplication } from '@nestjs/common';
import { PermissionService } from '../../src/permission/permission.service';

export const createPermission = (
  name: string,
  clientId: string,
  app: INestApplication,
) => {
  const service = app.get(PermissionService);
  return service.createPermission(
    { name, desc: name, clientId },
    100001n,
    true,
  );
};
