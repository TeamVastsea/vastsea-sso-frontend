import { RoleService } from 'src/role/role.service';

export const removeClient = (service: RoleService, id: bigint) => {
  return service.removeRole(id);
};
