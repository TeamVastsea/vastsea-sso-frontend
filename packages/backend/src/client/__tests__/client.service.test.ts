import { TestBed } from '@suites/unit';
import { ClientService } from '../client.service';
import { ClientCache } from '../client.cache';
import { PrismaService } from '@app/prisma';
import { Mocked } from '@suites/doubles.jest';
import { HttpException } from '@nestjs/common';

describe('ClientService', () => {
  let service: ClientService;
  let prisma: Mocked<PrismaService>;
  let cache: Mocked<ClientCache>;
  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(ClientService).compile();
    service = unit;
    prisma = unitRef.get(PrismaService) as any as Mocked<PrismaService>;
    cache = unitRef.get(ClientCache) as any as Mocked<ClientCache>;
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('CreateClient', () => {
    beforeEach(() => {
      prisma.client.create.mockReset();
      cache.putClientCache.mockReset();
    });
    it('Fail, client exist', () => {
      service['clientExistByName'] = jest.fn().mockResolvedValue(true);
      expect(
        service.createClient({
          name: '123',
        }),
      ).rejects.toThrow(HttpException);
    });
    it('Success', () => {
      service['clientExistByName'] = jest.fn().mockResolvedValue(false);
      prisma.client.create.mockResolvedValue({} as any);
      cache.putClientCache.mockResolvedValue({} as any);
      expect(
        service.createClient({
          name: '123',
        }),
      ).resolves.not.toThrow(HttpException);
    });
  });
  describe('RemoveClient', () => {
    beforeEach(() => {
      prisma.client.findFirst.mockReset();
      prisma.client.delete.mockReset();
      cache.clientExistByPk.mockReset();
      cache.getClientInfoByPk.mockReset();
      cache.removeClientInfo.mockReset();
    });

    it('Fail, client does not exist', async () => {
      cache.clientExistByPk.mockResolvedValue(0);
      prisma.client.findFirst.mockResolvedValue(null);

      await expect(service.removeClient(1n)).rejects.toThrow(HttpException);
      expect(prisma.client.findFirst).toHaveBeenCalledWith({
        where: { id: 1n },
      });
    });

    it('Success, client exists in cache', async () => {
      const mockClient = { id: 1n, name: 'test' } as any;
      cache.clientExistByPk.mockResolvedValue(1);
      cache.getClientInfoByPk.mockResolvedValue(mockClient);
      prisma.client.delete.mockResolvedValue(mockClient);
      cache.removeClientInfo.mockResolvedValue(mockClient);

      const result = await service.removeClient(1n);
      expect(result).toEqual(mockClient);
      expect(cache.getClientInfoByPk).toHaveBeenCalledWith(1n);
      expect(prisma.client.delete).toHaveBeenCalledWith({ where: { id: 1n } });
      expect(cache.removeClientInfo).toHaveBeenCalledWith(mockClient);
    });

    it('Success, client exists in database', async () => {
      const mockClient = { id: 1n, name: 'test' } as any;
      cache.clientExistByPk.mockResolvedValue(0);
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.client.delete.mockResolvedValue(mockClient);
      cache.removeClientInfo.mockResolvedValue(mockClient);

      const result = await service.removeClient(1n);
      expect(result).toEqual(mockClient);
      expect(prisma.client.findFirst).toHaveBeenCalledWith({
        where: { id: 1n },
      });
      expect(prisma.client.delete).toHaveBeenCalledWith({ where: { id: 1n } });
      expect(cache.removeClientInfo).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('UpdateClient', () => {
    beforeEach(() => {
      prisma.client.update.mockReset();
      cache.removeClientInfo.mockReset();
      cache.putClientCache.mockReset();
    });

    it('Success', async () => {
      const mockClient = { id: 1n, name: 'updated' } as any;
      prisma.client.update.mockResolvedValue(mockClient);
      cache.removeClientInfo.mockResolvedValue(mockClient);
      cache.putClientCache.mockResolvedValue(mockClient);

      const result = await service.updateClient(1n, mockClient);
      expect(result).toEqual(mockClient);
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: { ...mockClient },
      });
      expect(cache.removeClientInfo).toHaveBeenCalledWith(mockClient);
      expect(cache.putClientCache).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('FindClientById', () => {
    beforeEach(() => {
      cache.getClientInfoByPk.mockReset();
      cache.putClientCache.mockReset();
      prisma.client.findFirst.mockReset();
    });

    it('Success, client exists in cache', async () => {
      const mockClient = { id: 1n, name: 'test' } as any;
      cache.getClientInfoByPk.mockResolvedValue(mockClient);

      const result = await service.findClientById(1n);
      expect(result).toEqual(mockClient);
      expect(cache.getClientInfoByPk).toHaveBeenCalledWith(1n);
      expect(prisma.client.findFirst).not.toHaveBeenCalled();
    });

    it('Success, client exists in database', async () => {
      const mockClient = { id: 1n, name: 'test' } as any;
      cache.getClientInfoByPk.mockResolvedValue(null);
      prisma.client.findFirst.mockResolvedValue(mockClient);
      cache.putClientCache.mockResolvedValue(mockClient);

      const result = await service.findClientById(1n);
      expect(result).toEqual(mockClient);
      expect(prisma.client.findFirst).toHaveBeenCalledWith({
        where: { id: 1n },
      });
      expect(cache.putClientCache).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('GetClients', () => {
    beforeEach(() => {
      prisma.client.findMany.mockReset();
    });

    it('Success', async () => {
      const mockClients = [
        { id: 2n, name: 'client1' },
        { id: 3n, name: 'client2' },
      ] as any;
      prisma.client.findMany.mockResolvedValue(mockClients);

      const result = await service.getClients(1n, 2);
      expect(result.data).toEqual(mockClients);
      expect(prisma.client.findMany).toHaveBeenCalledWith({
        where: { id: { gt: 1n } },
        take: 2,
      });
    });
  });
  // it.todo('Remove Client');
  // it.todo('Update Client');
  // it.todo('Find Client By Id');
  // it.todo('Get Clients');
});
