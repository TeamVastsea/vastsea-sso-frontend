import { TestBed } from '@suites/unit';
import { ClientService } from '../client.service';
import { ConfigService } from '@app/config';
import { GlobalCounterService } from '@app/global-counter';
import { ClientCache } from '../client.cache';
import { PrismaService } from '@app/prisma';
import { Mocked } from '@suites/doubles.jest';
import { HttpException } from '@nestjs/common';

describe('ClientService', () => {
  let service: ClientService;
  let config: Mocked<ConfigService>;
  let cnt: Mocked<GlobalCounterService>;
  let prisma: Mocked<PrismaService>;
  let cache: Mocked<ClientCache>;
  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(ClientService).compile();
    service = unit;
    config = unitRef.get(ConfigService) as any as Mocked<ConfigService>;
    cnt = unitRef.get(
      GlobalCounterService,
    ) as any as Mocked<GlobalCounterService>;
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
  it.todo('Remove Client');
  it.todo('Update Client');
  it.todo('Find Client By Id');
  it.todo('Get Clients');
});
