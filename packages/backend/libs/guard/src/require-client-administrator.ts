import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ClientService } from '../../../src/client/client.service';
import { Reflector } from '@nestjs/core';
import {
  RequiredClientAdministratorKey,
  RequiredClientAdministratorMetaData,
} from '@app/decorator/required-client-administrator';
import { permissionJudge } from '@app/decorator';
import { isEmpty } from 'ramda';

@Injectable()
export class RequriedClientAdministratorGuard implements CanActivate {
  constructor(
    private client: ClientService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const data: RequiredClientAdministratorMetaData | undefined =
      this.reflector.getAllAndMerge(RequiredClientAdministratorKey, [
        context.getHandler(),
        context.getClass(),
      ]);
    if (isEmpty(data)) {
      return true;
    }
    const req: AuthReq = context.switchToHttp().getRequest();
    const user = req.user;
    if (user?.super) {
      return true;
    }
    const permission = user.permissions;
    const canIgnore = data.ignoreCondition
      ? permissionJudge(permission, data.ignoreCondition)
      : false;
    if (canIgnore) {
      return true;
    }
    const clientId = req[data.clientIdPosition][data.clientIdKey];
    if (!clientId) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }
    const realClient = await this.client.findClient({ clientId });
    if (!realClient) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    const bigintId = BigInt(user.id);
    if (
      realClient.administrator.every(
        (administrator) => administrator.id !== bigintId,
      ) &&
      !canIgnore
    ) {
      throw new HttpException(
        '你不能这么做, 因为你不是这个客户端的管理员',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
