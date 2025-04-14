import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { AutoRedis } from '@app/decorator';
import Redis, { Cluster } from 'ioredis';
import { GlobalCounterService } from '@app/global-counter';
import { CreatePermission } from './dto/create-permission';
import { isEmpty, isNil } from 'ramda';
import {
  CLIENT_PERMISSION_TOTAL,
  ID_COUNTER,
  PERMISSION_TOTAL,
} from '@app/constant';
import { UpdatePermission } from './dto/update-permission';

@Injectable()
export class PermissionService {
  // private logger: Logger = new Logger(PermissionService.name);
  constructor(
    private prisma: PrismaService,
    @AutoRedis() private redis: Redis | Cluster,
    private counter: GlobalCounterService,
  ) {}
  async createPermission(
    data: CreatePermission,
    actor: bigint,
    force: boolean,
  ) {
    const dbPermission = await this.findPermission({ name: data.name });
    if (dbPermission && dbPermission.clientId === data.clientId) {
      throw new HttpException('权限字段存在', HttpStatus.BAD_REQUEST);
    }
    if (
      dbPermission &&
      dbPermission.client.administrator.every(
        (administrator) => administrator.id !== actor,
      ) &&
      !force
    ) {
      throw new HttpException('你不是该客户端的管理员', HttpStatus.FORBIDDEN);
    }
    return this.prisma.permission
      .create({
        data: {
          id: await this.counter.incr(ID_COUNTER.PERMISSION),
          name: data.name,
          desc: data.desc,
          clientId: data.clientId,
          client: {
            connect: {
              clientId: data.clientId,
            },
          },
          active: data.active,
        },
      })
      .then((permission) =>
        this.redis.incr(PERMISSION_TOTAL).then(() => permission),
      )
      .then((permission) =>
        this.redis
          .incr(CLIENT_PERMISSION_TOTAL(data.clientId))
          .then(() => permission),
      );
  }
  async removePermission(id: bigint, accountId: bigint, force: boolean) {
    const dbPermission = await this.findPermission({ id });
    console.log(dbPermission, id);
    if (!dbPermission) {
      throw new HttpException('权限字段不存在', HttpStatus.NOT_FOUND);
    }
    if (!isEmpty(dbPermission.role)) {
      const roleNames = dbPermission.role.map((role) => role.name).join(',');
      throw new HttpException(
        `你不能这么做, 因为 ${roleNames} 绑定了该权限`,
        HttpStatus.CONFLICT,
      );
    }
    const client = await this.prisma.client.findFirst({
      where: {
        id: dbPermission.clientPK,
      },
      select: {
        administrator: { select: { id: true } },
      },
    });
    if (!client) {
      throw new HttpException('客户端不存在', HttpStatus.NOT_FOUND);
    }
    if (
      client.administrator.every((manage) => manage.id !== accountId) &&
      !force
    ) {
      throw new HttpException(
        '你不能停用这个权限字段, 因为权限字段所属的客户端您没有管理权限',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.prisma.permission.update({
      where: { id: dbPermission.id },
      data: {
        active: false,
      },
    });
  }
  /**
   * @description
   *
   * 修改的时候应该检查如下几件事
   *
   * 如果该权限不存在, 显然应该报错
   * 如果该权限存在, 但这个权限所属的客户端不归属用户管辖, 且没有 PERMISSION::UPDATE::* | * 权限, 那么就不能修改
   * 如果该权限存在, 这个权限所属的客户端规树用户管辖, 但是要转移到另一个客户端下, 如果目标客户端不归属用户管辖, 那么就应该拒绝。
   */
  async updatePermission(
    id: bigint,
    account: bigint,
    force: boolean,
    data: UpdatePermission,
  ) {
    const permission = await this.findPermission({ id });
    if (!permission) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    const client = await this.prisma.client.findFirst({
      where: {
        id: permission.clientPK,
        administrator: force
          ? undefined
          : {
              some: {
                id: account,
              },
            },
      },
    });
    if (!client) {
      throw new HttpException(
        '你不能修改这个权限字段, 该字段所属的客户端不归属于你',
        HttpStatus.FORBIDDEN,
      );
    }
    if (data.clientId) {
      const targetClient = await this.prisma.client.findFirst({
        where: {
          clientId: data.clientId,
        },
        include: {
          administrator: true,
        },
      });
      if (
        targetClient.administrator.every((manage) => manage.id !== account) &&
        !force
      ) {
        throw new HttpException(
          '你不能将该字段转移到不属于你管辖的客户端内',
          HttpStatus.FORBIDDEN,
        );
      }
    }
    return this.prisma.permission.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        desc: data.desc,
        active: data.active,
        client: data.clientId
          ? {
              connect: {
                clientId: data.clientId,
              },
            }
          : undefined,
      },
    });
  }
  async findPermission({
    name,
    id,
    accountId,
    force,
  }: {
    name?: string;
    id?: bigint;
    accountId?: bigint;
    force?: boolean;
  }) {
    if (isNil(name) && isNil(id)) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }
    const permission = await this.prisma.permission.findFirst({
      where: {
        OR: [{ id }, { name }],
      },
      include: {
        role: true,
        client: {
          include: {
            administrator: true,
          },
        },
      },
    });
    if (!permission || isEmpty(permission)) {
      return permission;
    }
    if (
      accountId &&
      permission.client.administrator.every(
        (manage) => manage.id !== accountId,
      ) &&
      !force
    ) {
      throw new HttpException('权限不足', HttpStatus.FORBIDDEN);
    }
    return permission;
  }
  async findPermissionList(
    size: number = 20,
    preId?: bigint,
    clientId?: string,
    isSuper?: boolean,
  ) {
    const total = (
      isSuper
        ? this.redis.get(PERMISSION_TOTAL)
        : this.redis.get(CLIENT_PERMISSION_TOTAL(clientId))
    ).then(BigInt);
    const data = this.prisma.permission.findMany({
      where: {
        id: {
          gt: preId,
        },
        clientId: isSuper ? undefined : clientId,
      },
      take: size,
    });
    return {
      total: await total,
      data: await data,
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
