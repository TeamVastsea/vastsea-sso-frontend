import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { clear } from './utils/setup';
import Redis from 'ioredis';
import {
  DEFAULT_REDIS_NAMESPACE,
  getRedisToken,
} from '@liaoliaots/nestjs-redis';
import request from 'supertest';
import { AUTH_EMAIL_CODE } from '@app/constant';
import { createUser } from './utils/create-user';
import { CreateAccount } from '../src/account/dto/create-account';

describe('Auth E2E test', () => {
  let app: INestApplication;
  let redis: Redis;
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();

    redis = app.get(getRedisToken(DEFAULT_REDIS_NAMESPACE));
    await clear('sqlite');
    await app.init();
    expect(redis).toBeDefined();
    await createUser(app, redis, 'test@no-reply.com', 'test');
  });
  describe('Register', () => {
    afterEach(async () => {
      await redis.flushall();
    });
    it('Register Success', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/account/mail-code?email=admin@no-reply.com')
        .send();
      expect(body.ttl).toBeGreaterThan(0);
      const code = await redis.get(AUTH_EMAIL_CODE('admin@no-reply.com'));
      expect(code).toBeDefined();
      const { statusCode, body: b2 } = await request(app.getHttpServer())
        .post('/account')
        .send({
          code,
          email: 'admin@no-reply.com',
          password: 'admin',
          profile: {
            nick: 'admin',
          },
        } as CreateAccount);
      expect(statusCode).toBe(HttpStatus.CREATED);
      expect(b2.profile.id).toBeDefined();
    });
    it('Register fail User exist', async () => {
      await createUser(app, redis, 'test@no-reply.com', 'test');
      const { status } = await request(app.getHttpServer())
        .post('/account/mail-code?email=test@no-reply.com')
        .send();
      expect(status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
