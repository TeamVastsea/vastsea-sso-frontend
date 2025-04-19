import { ConfigService } from '@app/config';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateClient } from './dto/create-client';
import { GlobalCounterService } from '@app/global-counter';
import {
  ACCOUNT_ASSIGN_CLIENT_TOTAL,
  CLIENT_TOTAL,
  ID_COUNTER,
} from '@app/constant';
import { PrismaService } from '@app/prisma';
import { createHash, randomBytes } from 'crypto';
import { ClientCache } from './client.cache';
import { UpdateClient } from './dto/update-client';
import { isEmpty, isNil } from 'ramda';
import { AutoRedis } from '@app/decorator';
import Redis, { Cluster } from 'ioredis';
import { Client, Prisma } from '@prisma/client';

@Injectable()
export class ClientService {
  private logger: Logger = new Logger(ClientService.name);
  constructor(
    private config: ConfigService,
    private cnt: GlobalCounterService,
    private prisma: PrismaService,
    private cache: ClientCache,
    @AutoRedis() private redis: Redis | Cluster,
  ) {}

  async createClient(data: CreateClient) {
    const accountList = await this.getValidManager(data.administrator);
    const client = await this.findClient({ name: data.name });
    if (client) {
      throw new HttpException('客户端已存在', HttpStatus.CONFLICT);
    }
    const id = await this.cnt.incr(ID_COUNTER.CLIENT);
    console.log(id);
    const { clientId, clientSecret } = this.getClientPair();
    return this.prisma.client
      .create({
        data: {
          id,
          name: data.name,
          desc: data.desc,
          clientId,
          clientSecret,
          administrator: {
            connect: accountList,
          },
          active: true,
          avatar: data.avatar,
          redirect: data.redirect,
        },
      })
      .then((client) => {
        return this.redis.incr(CLIENT_TOTAL()).then(() => client);
      })
      .then((client) => {
        return this.incrManagerClientTotal(
          accountList.map(({ id }) => id),
        ).then(() => client);
      })
      .then((client) => client);
  }
  async removeClient(id: bigint, actor: bigint, isSuper: boolean) {
    const client = await this.findClient({ id });
    if (!client) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    if (
      client.administrator.every((client) => client.id !== actor) &&
      !isSuper
    ) {
      throw new HttpException(
        '你不是该客户端的管理员, 所以你不能停用这个客户端',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.prisma.client.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });
  }
  async updateClient(
    id: bigint,
    data: UpdateClient,
    actor: bigint,
    isSuper: boolean,
  ) {
    const dbClient = await this.findClient({ id });
    if (!dbClient) {
      throw new HttpException('客户端不存在', HttpStatus.NOT_FOUND);
    }
    if (
      dbClient.administrator.every((client) => client.id !== actor) &&
      !isSuper
    ) {
      throw new HttpException(
        '你不是该客户端的管理员, 所以你不能修改这个客户端',
        HttpStatus.FORBIDDEN,
      );
    }
    const accounts = data.administrator
      ? this.getValidManager(data.administrator)
      : undefined;
    return this.prisma.client.update({
      where: {
        id,
      },
      data: {
        ...data,
        administrator: {
          connect: await accounts,
        },
      },
    });
  }
  findClient({
    name,
    id,
    active,
    clientId,
  }: {
    name?: string;
    id?: bigint;
    active?: boolean;
    clientId?: string;
  }) {
    if (isNil(name) && isNil(id) && isNil(clientId)) {
      throw new HttpException('参数错误', HttpStatus.BAD_REQUEST);
    }
    return this.prisma.client
      .findFirst({
        where: {
          OR: [{ name }, { id }, { clientId }],
          active: active,
        },
        include: {
          administrator: { select: { id: true, email: true, profile: true } },
        },
      })
      .then((client) => (isEmpty(client) ? null : client));
  }
  incrManagerClientTotal(managerIds: bigint[]) {
    return Promise.all(
      managerIds.map((id) => this.redis.incr(ACCOUNT_ASSIGN_CLIENT_TOTAL(id))),
    );
  }
  async findClientList(
    size: number = 20,
    preId?: bigint,
    accountId?: bigint,
    queryAll?: boolean,
  ) {
    const total = !queryAll
      ? this.redis.get(ACCOUNT_ASSIGN_CLIENT_TOTAL(accountId)).then(BigInt)
      : this.redis.get(CLIENT_TOTAL()).then(BigInt);
    const datas = this.prisma.client.findMany({
      where: {
        id: {
          gt: preId,
        },
        administrator: !queryAll
          ? {
              some: {
                id: accountId,
              },
            }
          : undefined,
      },
      take: size,
      include: {
        administrator: {
          select: {
            id: true,
            profile: {
              select: {
                nick: true,
                desc: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    return { total: await total, data: await datas };
  }
  getValidManager(idList: bigint[]) {
    return this.prisma.account.findMany({
      where: {
        OR: idList.map((id) => ({ id })),
      },
      select: { id: true },
    });
  }
  getClientPair() {
    const rawClientId = `${Date.now()}::${randomBytes(256).toString('base64')}::clientId`;
    const rawClientSecret = `${Date.now()}::${randomBytes(512).toString('base64')}::clientSecret`;
    const clientId = createHash('sha512')
      .update(rawClientId)
      .digest('base64')
      .slice(0, 32);
    const clientSecret = createHash('sha512')
      .update(rawClientSecret)
      .digest('base64')
      .slice(0, 32);
    return { clientId, clientSecret };
  }
  isAdministrator(administrator: bigint[], id: bigint) {
    return administrator.includes(id);
  }
}
