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
import { isNil } from 'ramda';

@Injectable()
export class RoleService {
  private logger: Logger = new Logger(RoleService.name);
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private redisCache: RedisCacheService,
    private cnt: GlobalCounterService,
    @AutoRedis() private redis: Redis | Cluster,
  ) {}

  async createRole(data: CreateRole) {
    const { name, desc, clientId, permissions, parent } = data;
    const dbRole = await this.getRoleByName(name, clientId);
    if (dbRole) {
      throw new HttpException(`${name} 存在`, HttpStatus.BAD_REQUEST);
    }
    const id = await this.cnt.incr(ID_COUNTER.ROLE);
    const role = this.prisma.role.create({
      data: {
        id,
        name,
        desc,
        clientId,
        permission: permissions
          ? {
              connect: permissions.map((id) => ({ id })),
            }
          : undefined,
        parents: parent
          ? {
              connect: parent.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        parents: true,
        permission: true,
      },
    });
    await this.redis.incr(ROLE_TOTAL);
    await this.redis.incr(CLIENT_ROLE_TOTAL(clientId));
    return role;
  }

  async updateRole(id: bigint, data: UpdateRole) {
    const role = await this.prisma.role.findFirst({
      where: {
        id,
      },
      select: { id: true, parents: true, name: true },
    });
    for (const id of data.parent ?? []) {
      const role = await this.prisma.role.findFirst({ where: { id: id } });
      if (!role) {
        throw new HttpException(`${id} 不存在`, HttpStatus.NOT_FOUND);
      }
    }
    if (!role) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    if (!isNil(data.active)) {
      const deletedParent = role.parents.filter((parent) => parent.deleted);
      const names = deletedParent.map((role) => role.name);
      if (names.length) {
        throw new HttpException(
          `${names.join(',')} 作为 ${role.name} 的父级. 如果要重新启用角色 ${role.name} 那么要将 ${role.name} 的所有父级启用`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const updatedRole = await this.prisma.role.update({
      where: {
        id,
      },
      data: {
        clientId: data.clientId,
        parents: data.parent
          ? {
              connect: data.parent.map((id) => ({ id })),
            }
          : undefined,
        desc: data.desc,
        name: data.name,
        deleted: !data.active,
        permission: data.permissions
          ? {
              connect: data.permissions.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        parents: true,
      },
    });
    if (isNil(data.active)) {
      return updatedRole;
    }
  }

  async removeRole(id: bigint) {
    const dbRole = await this.prisma.role.findFirst({
      where: { id },
      select: { children: true, name: true, deleted: true },
    });
    if (!dbRole || dbRole.deleted) {
      throw new HttpException(`${id} 不存在`, HttpStatus.NOT_FOUND);
    }

    if (dbRole.children.some((child) => !child.deleted)) {
      throw new HttpException(
        `${dbRole.name} 下存在子角色, 请先删除子角色`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const deletedRole = await this.prisma.role.update({
      where: { id },
      data: { deleted: true },
    });
    return deletedRole;
  }
  async getRoleInfo(id: bigint, clientId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, clientId },
      include: {
        permission: true,
        parents: true,
      },
    });
    if (!role) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    return role;
  }
  async getRoleList(preId?: bigint, size?: number, clientId?: string) {
    const total = this.redis.get(
      clientId ? CLIENT_ROLE_TOTAL(clientId) : ROLE_TOTAL,
    );
    const roles = this.prisma.role.findMany({
      where: {
        id: {
          gt: preId,
        },
        clientId,
      },
      take: size,
      include: {
        parents: true,
        permission: true,
      },
    });
    return { data: await roles, total: await total };
  }
  private getRoleByName(name: string, clientId: string) {
    return this.prisma.role.findFirst({
      where: { name, clientId },
      select: { id: true },
    });
  }
}
