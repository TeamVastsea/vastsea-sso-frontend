import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { AutoRedis } from '@app/decorator';
import Redis, { Cluster } from 'ioredis';
import { GlobalCounterService } from '@app/global-counter';
import { CreatePermission } from './dto/create-permission';
import { UpdatePermission } from './dto/update-permission';
import {
  CLIENT_PERMISSION_TOTAL,
  ID_COUNTER,
  PERMISSION_INFO_CACHE,
  PERMISSION_NAME_TO_ID,
  PERMISSION_TOTAL,
} from '@app/constant';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionService {
  private logger: Logger = new Logger(PermissionService.name);
  constructor(
    private prisma: PrismaService,
    @AutoRedis() private redis: Redis | Cluster,
    private counter: GlobalCounterService,
  ) {}
  async createPermission(body: CreatePermission) {
    const { name, desc, clientId } = body;
    const id = BigInt(await this.redis.hget(PERMISSION_NAME_TO_ID, name));
    if (id) {
      const { name } = await this.getPermissionInfo(id, clientId);
      throw new HttpException(`${name} 已存在`, HttpStatus.BAD_REQUEST);
    }
    const dbId = await this.counter.incr(ID_COUNTER.PERMISSION);
    const handle = this.prisma.permission.create({
      data: {
        id: dbId,
        name,
        desc,
        clientId,
      },
    });

    return handle.then((permission) => {
      return this.redis
        .incr(PERMISSION_TOTAL)
        .then(() => this.redis.incr(CLIENT_PERMISSION_TOTAL(clientId)))
        .then(() => this.updateCache(id, permission, 60))
        .then(() => permission);
    });
  }
  async removePermission(id: bigint, clientId: string) {
    const permission = await this.getPermissionInfo(id, clientId);
    if (permission) {
      throw new HttpException(
        `${permission.name} 已存在`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const handle = this.prisma.permission.delete({
      where: {
        id,
        clientId,
      },
    });
    return handle.then((removedPermission) => {
      const { id, clientId } = removedPermission;
      return this.redis
        .decr(PERMISSION_TOTAL)
        .then(() => this.redis.decr(CLIENT_PERMISSION_TOTAL(clientId)))
        .then(() => this.redis.del(PERMISSION_INFO_CACHE(id)))
        .then(() => removedPermission);
    });
  }
  async updatePermission(id: bigint, clientId: string, body: UpdatePermission) {
    const info = await this.getPermissionInfo(id, clientId);
    if (!info) {
      throw new HttpException(`${id} 不存在`, HttpStatus.NOT_FOUND);
    }
    const permission = await this.prisma.permission.update({
      where: {
        id,
        clientId,
      },
      data: {
        ...body,
      },
    });
    await this.updateCache(id, permission, 60);
    return permission;
  }
  private async updateCache(
    id: bigint,
    permission: Permission,
    expire: number,
  ) {
    await this.redis.hmset(PERMISSION_INFO_CACHE(id), permission);
    await this.redis.expire(PERMISSION_INFO_CACHE(id), expire);
  }
  async getPermissionInfo(id: bigint, clientId: string) {
    let info: Permission | null = (await this.redis.hgetall(
      PERMISSION_INFO_CACHE(id),
    )) as unknown as Permission | null;
    if (!info) {
      info = await this.prisma.permission.findFirst({
        where: {
          clientId,
          id,
        },
      });
    }
    return info;
  }
  async getPermissionList(id?: bigint, clientId?: string, size?: number) {
    const permissions = this.prisma.permission.findMany({
      where: {
        id: {
          gt: id,
        },
        clientId,
      },
      take: size,
    });
    const total = clientId
      ? this.redis.get(CLIENT_PERMISSION_TOTAL(clientId))
      : this.redis.get(PERMISSION_TOTAL);
    return {
      permissions: await permissions,
      total: await total,
    };
  }
  async getAccountPermission(account: bigint, clientId: string) {
    // TODO: should add cache.
    const roles = await this.prisma.account.findFirst({
      where: { id: account },
      select: {
        role: {
          where: {
            clientId,
          },
          select: {
            permission: true,
          },
        },
      },
    });
    if (!roles) {
      throw new HttpException(`用户不存在`, HttpStatus.BAD_REQUEST);
    }
    const { role } = roles;
    if (!role.length) {
      return [];
    }
    return role
      .flatMap((role) => role.permission)
      .flatMap((permission) => permission.name);
  }
}
