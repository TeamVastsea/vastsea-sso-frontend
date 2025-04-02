import { ConfigService } from '@app/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateClient } from './dto/create-client';
import { GlobalCounterService } from '@app/global-counter';
import { ID_COUNTER } from '@app/constant';
import { PrismaService } from '@app/prisma';
import { createHash, randomBytes } from 'crypto';
import { ClientCache } from './client.cache';
import { Client } from '@prisma/client';

@Injectable()
export class ClientService {
  constructor(
    private config: ConfigService,
    private cnt: GlobalCounterService,
    private prisma: PrismaService,
    private cache: ClientCache,
  ) {}

  async createClient(data: CreateClient) {
    const { name, desc, avatar, redirect } = data;
    const clientExist = await this.clientExistByName(name);
    if (clientExist) {
      throw new HttpException(`${name} 存在`, HttpStatus.CONFLICT);
    }
    const id = await this.cnt.incr(ID_COUNTER.CLIENT);

    const { clientId, clientSecret } = this.generateClientIdAndSecret(name);
    const client = await this.prisma.client.create({
      data: {
        name,
        desc,
        avatar,
        id,
        clientId,
        clientSecret,
        redirect,
      },
    });
    return this.cache.putClientCache(client).then(() => client);
  }
  async removeClient(id: bigint) {
    const client = (await this.cache.clientExistByPk(id))
      ? await this.cache.getClientInfoByPk(id)
      : await this.prisma.client.findFirst({
          where: { id },
        });
    if (!client) {
      throw new HttpException(`客户端不存在`, HttpStatus.NOT_FOUND);
    }
    return this.prisma.client
      .delete({
        where: {
          id,
        },
      })
      .then(() => {
        return this.cache.removeClientInfo(client);
      })
      .then(() => client);
  }
  async updateClient(id: bigint, client: Client) {
    return this.prisma.client
      .update({
        where: {
          id,
        },
        data: {
          ...client,
        },
      })
      .then((client) => {
        return Promise.all([
          this.cache.removeClientInfo(client),
          this.cache.putClientCache(client),
        ]);
      });
  }
  async findClientById(id: bigint) {
    const client = await this.cache.getClientInfoByPk(id);
    if (client) {
      return client;
    }
    const dbClient = await this.prisma.client.findFirst({
      where: {
        id,
      },
    });
    return this.cache.putClientCache(dbClient).then(() => dbClient);
  }
  getClients(preId: bigint, size: number) {
    // TODO: cache me.
    return this.prisma.client.findMany({
      where: {
        id: {
          gt: preId,
        },
      },
      take: size,
    });
  }

  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
  private generateClientIdAndSecret(clientName: string) {
    const randomClientIdSalt = this.sha256(randomBytes(32).toString());
    const clientIdSha256 = this.sha256(clientName);
    const randomClientSecretSalt = this.sha256(randomBytes(64).toString());
    const clientSecretSha256 = this.sha256(randomBytes(128).toString());
    const clientId = this.sha256(
      `${clientIdSha256}${randomClientIdSalt}`,
    ).slice(0, this.config.get('client.idLen'));
    const clientSecret = this.sha256(
      `${clientSecretSha256}${randomClientSecretSalt}`,
    ).slice(0, this.config.get('client.secretLen'));
    return {
      clientId,
      clientSecret,
    };
  }
  private async clientExistByName(name: string) {
    const cache = await this.cache.clientExists(name);
    if (cache) {
      return true;
    }
    return this.prisma.client
      .findFirst({
        where: {
          name,
        },
      })
      .then((client) => client !== null);
  }
}
