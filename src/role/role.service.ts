import { CLIENT_ROLE_TOTAL, ID_COUNTER, ROLE_TOTAL } from '@app/constant';
import { AutoRedis } from '@app/decorator';
import { PrismaService } from '@app/prisma';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Redis, { Cluster } from 'ioredis';
import { CreateRole } from './dto/create-role.dto';
import { GlobalCounterService } from '@app/global-counter';
import { UpdateRole } from './dto/update-role.dto';

// TODO: Cache for all service

@Injectable()
export class RoleService {
  constructor(
    private prisma: PrismaService,
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

  async updateRole(id: bigint, clientId: string, body: UpdateRole) {
    const oldRole = await this.getRoleInfo(id, clientId);
    if (!oldRole) {
      throw new HttpException('角色不存在', HttpStatus.NOT_FOUND);
    }
    return this.prisma.role.update({
      where: {
        id,
        clientId,
      },
      data: {
        name: body.name,
        desc: body.desc,
        parents: {
          connect: body.parent.map((id) => ({ id })),
        },
        permission: {
          connect: body.parent.map((id) => ({ id })),
        },
      },
    });
  }
  async getRoleList(clientId: string, preId?: bigint, size?: number) {
    const total = this.redis.get(CLIENT_ROLE_TOTAL(clientId));
    const roles = this.prisma.role.findMany({
      where: {
        id: {
          gt: preId,
        },
      },
      take: size,
    });
    return {
      data: await roles,
      total: await total,
    };
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
