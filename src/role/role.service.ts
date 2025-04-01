import { ConfigService } from '@app/config';
import { CLIENT_ROLE_TOTAL, ID_COUNTER, ROLE_TOTAL } from '@app/constant';
import { AutoRedis } from '@app/decorator';
import { PrismaService } from '@app/prisma';
import { RedisCacheService } from '@app/redis-cache';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Permission, Prisma, Role } from '@prisma/client';
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

  /**
   * @description 创建时写入缓存, permission, parents分开存id，避免产生大key
   */
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
  async removeRole(id: bigint, clientId: string) {
    const dbRole = await this.prisma.role.findFirst({
      where: { id, clientId },
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
  }
  getRoleInfo(id: bigint, clientId: string) {
    return this.prisma.role.findFirst({
      where: { id, clientId },
      select: {
        permission: true,
      },
    });
  }
  private getRoleByName(name: string) {
    return this.prisma.role.findFirst({
      where: { name },
      select: { id: true },
    });
  }
}
