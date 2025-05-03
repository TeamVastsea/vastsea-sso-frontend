import { ConfigService } from '@app/config';
import { CLIENT_ROLE_TOTAL, ID_COUNTER, ROLE_TOTAL } from '@app/constant';
import { AutoRedis } from '@app/decorator';
import { PrismaService } from '@app/prisma';
import { RedisCacheService } from '@app/redis-cache';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import Redis, { Cluster } from 'ioredis';
import { CreateRole } from './dto/create-role.dto';
import { GlobalCounterService } from '@app/global-counter';
import { UpdateRole } from './dto/update-role.dto';
import { isEmpty, isNil } from 'ramda';
import { Prisma } from '@prisma/client';
import { ClientService } from '../client/client.service';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class RoleService {
  private logger: Logger = new Logger(RoleService.name);
  constructor(
    private prisma: PrismaService,
    private client: ClientService,
    private permission: PermissionService,
    private config: ConfigService,
    private redisCache: RedisCacheService,
    private cnt: GlobalCounterService,
    @AutoRedis() private redis: Redis | Cluster,
  ) {}

  async createRole(data: CreateRole) {
    const permissions = await this.validPermissions(
      data.clientId,
      data.permissions,
    );
    const handles = data.parent?.map((id) => this.findRole({ id })) ?? [];
    const permissionIds = permissions.map((permission) => ({
      id: permission.id,
    }));
    const parents = Promise.all(handles).then((roles) => {
      if (!roles) {
        return [];
      }
      if (roles.some((role) => isNil(role) || isEmpty(role))) {
        throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
      }
      return roles.map((role) => ({ id: role.id }));
    });
    const id = await this.cnt.incr(ID_COUNTER.ROLE);
    return this.prisma.role
      .create({
        data: {
          id,
          name: data.name,
          desc: data.desc,
          permission: {
            connect: permissionIds,
          },
          parents: {
            connect: await parents,
          },
          client: {
            connect: {
              clientId: data.clientId,
            },
          },
          clientId: data.clientId,
        },
      })
      .then((role) => this.redis.incr(ROLE_TOTAL).then(() => role))
      .then((role) =>
        this.redis.incr(CLIENT_ROLE_TOTAL(data.clientId)).then(() => role),
      )
      .then((role) => role);
  }
  async removeRole(id: bigint) {
    const role = await this.findRole({ id });
    if (!role) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    return this.prisma.role.update({
      where: { id },
      data: {
        active: false,
      },
    });
  }
  async updateRole(
    id: bigint,
    data: UpdateRole,
    actor: bigint,
    force: boolean = false,
  ) {
    const sourceRole = await this.prisma.role.findFirst({
      where: {
        id,
        client: !force
          ? {
              administrator: {
                some: { id: actor },
              },
            }
          : undefined,
      },
    });
    if (!sourceRole) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    const targetClient = data.clientId
      ? await this.client.findClient({ clientId: data.clientId })
      : undefined;
    if (targetClient) {
      const adminIds = targetClient.administrator.map((admin) => admin.id);
      if (!force && !this.client.isAdministrator(adminIds, actor)) {
        throw new HttpException(
          '你不是目标客户端的管理员',
          HttpStatus.FORBIDDEN,
        );
      }
    }
    const permissions = !data.permissions
      ? undefined
      : Promise.all(
          data.permissions.map((id) =>
            this.permission.findPermission({ id, accountId: actor, force }),
          ),
        )
          .then((permissions) => {
            return permissions;
          })
          .then((permissions) => {
            return permissions.map((permission) => ({ id: permission.id }));
          })
          .catch((err) => {
            throw err;
          });
    const targetRoles = data.parent
      ? await this.prisma.role.findMany({
          where: {
            id: {
              in: data.parent,
            },
          },
          select: {
            id: true,
          },
        })
      : undefined;
    return this.prisma.role
      .update({
        where: {
          id,
        },
        data: {
          name: data.name,
          desc: data.desc,
          permission: (await permissions)
            ? {
                set: [],
                connect: await permissions,
              }
            : undefined,
          parents: targetRoles
            ? {
                set: [],
                connect: targetRoles,
              }
            : undefined,
          client: targetClient
            ? {
                connect: {
                  id: targetClient.id,
                },
              }
            : undefined,
          clientId: targetClient.clientId,
          active: data.active,
        },
        include: {
          parents: true,
        },
      })
      .then((role) => role);
  }

  findRole(
    { id }: { id: bigint },
    include: Prisma.RoleInclude = {
      permission: { select: { id: true, name: true, desc: true } },
    },
  ) {
    return this.prisma.role.findFirst({
      where: {
        id,
      },
      include,
    });
  }
  findRoleList(
    size: number,
    preId?: bigint,
    clientId?: string,
    all?: boolean,
    name?: string,
  ) {
    if (!all && !clientId) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }
    const rawKey =
      all && !clientId
        ? this.redis.get(ROLE_TOTAL)
        : this.redis.get(CLIENT_ROLE_TOTAL(clientId));
    let total = rawKey.then((val) => {
      return BigInt(val ?? 0);
    });
    const data = this.prisma.role.findMany({
      where: {
        id: {
          gt: preId,
        },
        clientId: all && !clientId ? undefined : clientId,
        name: {
          contains: name,
        },
      },
      take: size,
    });
    if (name) {
      total = this.prisma.role
        .count({
          where: {
            name: {
              contains: name,
            },
          },
        })
        .then((val) => BigInt(val ?? 0));
    }
    return data.then((data) => {
      return total.then((total) => {
        return { data, total };
      });
    });
  }
  /**
   *
   * @throws {HttpException} 如果有一个角色不在该客户端下, 那么会抛出 400 参数错误
   */
  async validRole(clientId: string, roleIds: bigint[]) {
    const roles = await this.prisma.role.findMany({
      where: {
        id: {
          in: roleIds,
        },
        clientId,
      },
      select: { id: true },
    });
    if (roles.length > roleIds.length) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }
    return roles;
  }
  /**
   * @throws {HttpException} 如果有一个权限不在该客户端下, 那么会抛出 400 参数错误
   */
  async validPermissions(clientId: string, permissions: bigint[]) {
    const dbPermissions = await this.prisma.permission.findMany({
      where: {
        id: {
          in: permissions,
        },
        clientId,
      },
      select: { id: true },
    });
    if (dbPermissions.length > permissions.length) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }
    return dbPermissions;
  }
}
