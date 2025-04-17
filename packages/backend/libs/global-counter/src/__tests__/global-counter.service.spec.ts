import { Test, TestingModule } from '@nestjs/testing';
import { GlobalCounterService } from '../global-counter.service';
import {
  DEFAULT_REDIS_NAMESPACE,
  getRedisToken,
} from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { HttpException } from '@nestjs/common';

describe('GlobalCounterService', () => {
  let service: GlobalCounterService;
  let redis: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalCounterService,
        {
          provide: getRedisToken(DEFAULT_REDIS_NAMESPACE),
          useValue: {
            exists: jest.fn(),
            hset: jest.fn(),
            incrby: jest.fn(),
            hget: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GlobalCounterService>(GlobalCounterService);
    redis = module.get<Redis>(getRedisToken(DEFAULT_REDIS_NAMESPACE));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('register', () => {
    it('Counter not exists', async () => {
      redis['exists'] = jest.fn().mockResolvedValue(false);
      await expect(service.register('', 1, 10)).resolves.toBeUndefined();
      expect(redis['exists']).toHaveBeenCalled();
      expect(redis['hset']).toHaveBeenCalled();
      expect(redis['incrby']).toHaveBeenCalled();
    });
    it('Counter exists', async () => {
      redis['exists'] = jest.fn().mockResolvedValue(true);
      await expect(service.register('', 1, 10)).rejects.toThrow(HttpException);
      expect(redis['hset']).not.toHaveBeenCalled();
      expect(redis['incrby']).not.toHaveBeenCalled();
    });
  });
  describe('incr', () => {
    it('Counter not exists', async () => {
      redis['exists'] = jest.fn().mockResolvedValue(false);
      await expect(service.incr('')).rejects.toThrow(HttpException);
    });
    it('Counter exists', async () => {
      redis['exists'] = jest.fn().mockResolvedValue(true);
      await service.incr('123');
      expect(redis['incrby']).toHaveBeenCalled();
    });
  });
});
