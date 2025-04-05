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
    const { name, desc, clientId, permissions } = data;
    const dbRole = await this.getRoleByName(name);
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
        permission: {
          connect: permissions.map((id) => ({ id })),
        },
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
      select: { id: true },
    });
    if (!role) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    return this.prisma.role.update({
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
        permission: data.permissions
          ? {
              connect: data.permissions.map((id) => ({ id })),
            }
          : undefined,
      },
    });
  }

  async removeRole(id: bigint) {
    const dbRole = await this.prisma.role.findFirst({
      where: { id },
      select: { children: true, name: true, deleted: true },
    });
    if (!dbRole || dbRole.deleted) {
      throw new HttpException(`${id} 不存在`, HttpStatus.NOT_FOUND);
    }
    if (dbRole.children.length) {
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
  getRoleInfo(id: bigint, clientId: string) {
    return this.prisma.role.findFirst({
      where: { id, clientId },
      select: {
        permission: true,
      },
    });
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
  private getRoleByName(name: string) {
    return this.prisma.role.findFirst({
      where: { name },
      select: { id: true },
    });
  }
}
