import { Permission, Role } from '@prisma/client';
import { RoleService } from 'src/role/role.service';

export const createRole = (
  roleService: RoleService,
  name: string,
  parent: bigint[] | Role[],
  permission: bigint[] | Permission[],
  clientId: string = process.env.CLIENT_ID,
) => {
  return roleService.createRole({
    name,
    desc: name,
    clientId,
    parent: parent.map((parent) =>
      typeof parent === 'bigint' ? parent : parent.id,
    ),
    permissions: permission.map((p) => (typeof p === 'bigint' ? p : p.id)),
  });
};
