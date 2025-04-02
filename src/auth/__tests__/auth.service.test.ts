// import { Test, TestingModule } from '@nestjs/testing';
import { TestBed } from '@suites/unit';
import { AuthService } from '../auth.service';
import Redis, { Cluster } from 'ioredis';
import { PrismaService } from '@app/prisma';
import { ConfigService } from '@app/config';
import { JwtService } from '@app/jwt';
import { GlobalCounterService } from '@app/global-counter';
import { MailerService } from '@nestjs-modules/mailer';
import type { Mocked } from '@suites/doubles.jest';
import {
  DEFAULT_REDIS_NAMESPACE,
  getRedisToken,
} from '@liaoliaots/nestjs-redis';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OAUTH_CODE_ID_PAIR } from '@app/constant';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: Mocked<PrismaService>;
  let config: Mocked<ConfigService>;
  let jwt: Mocked<JwtService>;
  let cnt: Mocked<GlobalCounterService>;
  let mail: Mocked<MailerService>;
  let redis: Mocked<Redis | Cluster>;
  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthService).compile();
    service = unit;
    prisma = unitRef.get(PrismaService) as any as Mocked<PrismaService>;
    config = unitRef.get(ConfigService) as any as Mocked<ConfigService>;
    jwt = unitRef.get(JwtService) as any as Mocked<JwtService>;
    cnt = unitRef.get(
      GlobalCounterService,
    ) as any as Mocked<GlobalCounterService>;
    mail = unitRef.get(MailerService) as any as Mocked<MailerService>;
    redis = unitRef.get(
      getRedisToken(DEFAULT_REDIS_NAMESPACE),
    ) as any as Mocked<Redis | Cluster>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreateAccount', () => {
    const mockDTO = {
      email: 'no@reply.com',
      code: 'code',
      password: 'pwd',
      profile: {
        nick: 'test',
      },
    };
    it('Fail, Email exist', async () => {
      prisma.account.findFirst.mockResolvedValue({} as any);
      expect(service.createAccount(mockDTO)).rejects.toThrow(HttpException);
    });
    it('Fail, Email code not exist', () => {
      prisma.account.findFirst.mockResolvedValue(null as any);
      redis.get.mockResolvedValue(null);
      expect(service.createAccount(mockDTO)).rejects.toThrow(HttpException);
    });
    it('Fail, Email code not success', () => {
      prisma.account.findFirst.mockReturnValueOnce(null as any);
      redis.get.mockResolvedValue('code2');
      expect(service.createAccount(mockDTO)).rejects.toThrow(
        new HttpException('验证码不正确', HttpStatus.BAD_REQUEST),
      );
    });
    it('Success', async () => {
      prisma.account.findFirst.mockReturnValueOnce(null);
      redis.get.mockResolvedValueOnce('code');
      cnt.incr.mockResolvedValueOnce(BigInt(1));
      prisma.account.create.mockResolvedValue({
        id: BigInt(1),
        email: 'no@reply.com',
        profile: {
          nick: '123',
        } as any,
      } as any);
      await service.createAccount(mockDTO);
      expect(prisma.account.findFirst).toHaveBeenCalled();
      expect(redis.get).toHaveBeenCalled();
      expect(cnt.incr).toHaveBeenCalled();
      expect(prisma.account.create).toHaveBeenCalled();
    });
  });
  it('Create Email Code success', async () => {
    mail.sendMail.mockResolvedValue(null);
    await expect(
      service.createEmailCode('admin@no-reply.com'),
    ).resolves.not.toThrow();
  });
  describe('Get Client Secret', () => {
    it('Cache Trigger', async () => {
      redis.get.mockResolvedValueOnce('123');
      await expect(service.getClientSecret('456')).resolves.toBe('123');
    });
    it('Cache miss', async () => {
      redis.get.mockResolvedValueOnce(null);
      prisma.client.findFirst.mockResolvedValue({
        clientId: '456',
        clientSecret: '123',
        id: BigInt(0),
        name: '',
        redirect: '',
      });
      await expect(service.getClientSecret('456')).resolves.toBe('123');
      expect(prisma.client.findFirst).toHaveBeenCalledTimes(1);
      expect(redis.set).toHaveBeenCalled();
      expect(redis.expire).toHaveBeenCalled();
    });
    it('Client not exists', async () => {
      redis.get.mockResolvedValueOnce(null);
      prisma.client.findFirst.mockResolvedValue(null);
      await expect(service.getClientSecret('456')).rejects.toThrow(
        new HttpException('客户端不存在', HttpStatus.BAD_REQUEST),
      );
    });
  });
  describe('generateToken', () => {
    const mockCode = 'mockCode';
    const mockClientId = 'mockClientId';
    const mockClientSecret = 'mockClientSecret';
    const mockAccountId = 'mockAccountId';
    const mockAccessToken = 'mockAccessToken';
    const mockRefreshToken = 'mockRefreshToken';

    beforeEach(() => {
      redis.exists.mockReset();
      redis.hgetall.mockReset();
      redis.pttl.mockReset();
      redis.get.mockReset();
      redis.multi.mockReset();
      jwt.sign.mockReset();
    });

    it('should throw if the authorization code is expired', async () => {
      redis.exists.mockResolvedValue(0);
      await expect(
        service.generateToken(mockCode, mockClientId, mockClientSecret),
      ).rejects.toThrow(
        new HttpException('授权码过期', HttpStatus.UNAUTHORIZED),
      );
      expect(redis.exists).toHaveBeenCalledWith(OAUTH_CODE_ID_PAIR(mockCode));
    });

    it('should throw if clientId does not match', async () => {
      redis.exists.mockResolvedValue(1);
      redis.hgetall.mockResolvedValue({
        clientId: 'wrongClientId',
        clientSecret: mockClientSecret,
        accountId: mockAccountId,
      });
      await expect(
        service.generateToken(mockCode, mockClientId, mockClientSecret),
      ).rejects.toThrow(
        new HttpException(
          '授权码对应的ClientId与传入的ClientId 不一致',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw if clientSecret does not match', async () => {
      redis.exists.mockResolvedValue(1);
      redis.hgetall.mockResolvedValue({
        clientId: mockClientId,
        clientSecret: 'wrongClientSecret',
        accountId: mockAccountId,
      });
      await expect(
        service.generateToken(mockCode, mockClientId, mockClientSecret),
      ).rejects.toThrow(
        new HttpException('Client Secret 错误', HttpStatus.BAD_REQUEST),
      );
    });

    it('should return cached tokens if they are still valid', async () => {
      redis.exists.mockResolvedValue(1);
      redis.hgetall.mockResolvedValue({
        clientId: mockClientId,
        clientSecret: mockClientSecret,
        accountId: mockAccountId,
      });
      redis.pttl.mockResolvedValue(2000);
      redis.get.mockResolvedValueOnce(mockAccessToken);
      redis.get.mockResolvedValueOnce(mockRefreshToken);

      const result = await service.generateToken(
        mockCode,
        mockClientId,
        mockClientSecret,
      );

      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        expire: { access: 2000, refresh: 2000 },
        expireAt: {
          access: `${Date.now() + 2000}`,
          refresh: `${Date.now() + 2000}`,
        },
      });
      expect(redis.get).toHaveBeenCalledTimes(2);
    });

    it('should generate new tokens and cache them if no valid tokens exist', async () => {
      redis.exists.mockResolvedValue(1);
      redis.hgetall.mockResolvedValue({
        clientId: mockClientId,
        clientSecret: mockClientSecret,
        accountId: mockAccountId,
      });
      redis.pttl.mockResolvedValue(0);
      jwt.sign.mockResolvedValueOnce(mockAccessToken);
      jwt.sign.mockResolvedValueOnce(mockRefreshToken);
      const mockMulti = {
        set: jest.fn().mockReturnThis(),
        pexpire: jest.fn().mockReturnThis(),
        hset: jest.fn().mockReturnThis(),
        exec: jest.fn(),
      };
      redis.multi.mockReturnValue(mockMulti as any);

      const result = await service.generateToken(
        mockCode,
        mockClientId,
        mockClientSecret,
      );

      expect(result.access_token).toEqual(mockAccessToken);
      expect(result.refresh_token).toEqual(mockRefreshToken);
      expect(result.expire).toEqual({
        access: config.get('cache.ttl.auth.token.access'),
        refresh: config.get('cache.ttl.auth.token.refresh'),
      });
      expect(mockMulti.set).toHaveBeenCalledTimes(2);
      expect(mockMulti.pexpire).toHaveBeenCalledTimes(3);
      expect(mockMulti.hset).toHaveBeenCalledTimes(1);
      expect(mockMulti.exec).toHaveBeenCalled();
    });
  });
  describe('refreshToken', () => {
    const mockUserId = 'mockUserId';
    const mockRefreshToken = 'mockRefreshToken';
    const mockClientId = 'mockClientId';
    const mockClientSecret = 'mockClientSecret';
    const mockAccessToken = 'mockAccessToken';
    const mockNewRefreshToken = 'mockNewRefreshToken';

    beforeEach(() => {
      redis.get.mockReset();
      redis.multi.mockReset();
      prisma.client.findFirst.mockReset();
      jwt.sign.mockReset();
    });

    it('should throw if client secret is incorrect', async () => {
      prisma.client.findFirst.mockResolvedValue({
        clientSecret: 'wrongSecret',
      } as any);
      await expect(
        service.refreshToken(
          mockUserId,
          mockRefreshToken,
          mockClientId,
          mockClientSecret,
        ),
      ).rejects.toThrow(
        new HttpException('client secret 错误', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw if refresh token is expired', async () => {
      redis.get.mockResolvedValue(null);
      prisma.client.findFirst.mockResolvedValue({
        clientId: mockClientId,
        clientSecret: mockClientSecret,
      } as any);
      await expect(
        service.refreshToken(
          mockUserId,
          mockRefreshToken,
          mockClientId,
          mockClientSecret,
        ),
      ).rejects.toThrow(
        new HttpException('刷新令牌已过期', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw if refresh token is incorrect', async () => {
      redis.get
        .mockResolvedValueOnce(mockClientSecret)
        .mockResolvedValueOnce('wrongRefreshToken');
      prisma.client.findFirst.mockResolvedValue({
        clientId: mockClientId,
        clientSecret: mockClientSecret,
      } as any);
      await expect(
        service.refreshToken(
          mockUserId,
          mockRefreshToken,
          mockClientId,
          mockClientSecret,
        ),
      ).rejects.toThrow(
        new HttpException('刷新令牌不正确', HttpStatus.BAD_REQUEST),
      );
    });

    it('should generate new tokens and update cache', async () => {
      redis.get
        .mockResolvedValueOnce(mockClientSecret)
        .mockResolvedValueOnce(mockRefreshToken);
      prisma.client.findFirst.mockResolvedValue({
        clientId: mockClientId,
        clientSecret: mockClientSecret,
      } as any);
      jwt.sign.mockResolvedValueOnce(mockAccessToken);
      jwt.sign.mockResolvedValueOnce(mockNewRefreshToken);
      const mockMulti = {
        set: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        hset: jest.fn().mockReturnThis(),
        exec: jest.fn(),
      };
      redis.multi.mockReturnValue(mockMulti as any);

      const result = await service.refreshToken(
        mockUserId,
        mockRefreshToken,
        mockClientId,
        mockClientSecret,
      );

      expect(result.access_token).toEqual(mockAccessToken);
      expect(result.refresh_token).toEqual(mockNewRefreshToken);
      expect(result.expire).toEqual({
        access: config.get('cache.ttl.auth.token.access'),
        refresh: config.get('cache.ttl.auth.token.refresh'),
      });
      expect(mockMulti.set).toHaveBeenCalledTimes(2);
      expect(mockMulti.expire).toHaveBeenCalledTimes(2);
      expect(mockMulti.hset).toHaveBeenCalledTimes(1);
      expect(mockMulti.exec).toHaveBeenCalled();
    });
  });
  describe('Generate Auth Code', () => {
    beforeEach(() => {
      prisma.client.findFirst.mockReset();
      prisma.account.findFirst.mockReset();
    });
    it('Client not Exist', async () => {
      prisma.client.findFirst.mockResolvedValue(null);
      await expect(
        service.generateAuthCode('admin@no-reply.com', 'pwd', 'client-id'),
      ).resolves.toMatchObject({
        ok: false,
      });
    });
    it('User Not Found', async () => {
      prisma.account.findFirst.mockRejectedValue(null);
      await expect(
        service.generateAuthCode('admin@no-reply.com', 'pwd', 'client-id'),
      ).resolves.toMatchObject({
        ok: false,
      });
    });
    it('Success', () => {
      service.verifyPassword = jest.fn().mockReturnValue(true);
      prisma.client.findFirst.mockResolvedValue({
        clientId: 'client-id',
      } as any);
      prisma.account.findFirst.mockResolvedValue({
        id: BigInt(0),
        password: '',
        salt: '',
        iterations: 1000,
      } as any);
      expect(
        service.generateAuthCode('admin@no-reply.com', 'pwd', 'client-id'),
      ).resolves.toMatchObject({
        ok: true,
      });
    });
  });
});
