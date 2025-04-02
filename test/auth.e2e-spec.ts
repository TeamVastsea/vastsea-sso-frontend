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
import { Register } from '../src/auth/dto/register.dto';
import { AUTH_EMAIL_CODE } from '@app/constant';
import { createUser } from './utils/create-user';

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
  afterAll(async () => {
    await redis.flushdb();
  });

  describe('Login', () => {
    it.todo('should redirect to client redirect');
    it.todo('should redirect to redirect query, because client not found');
    it.todo(
      'should redirect to common error redirect, because client not found and `redirect` query is undefined',
    );
  });
  describe('GetToken', () => {
    it.todo('should return tokenPair');
    it.todo('should throw unauthorized error, becuase code expire');
    it.todo('should return bad request,because client id invalid');
    it.todo('should return bad request, because clientSecret invalid');
  });
  describe('Get MailCode', () => {
    it.todo('Success');
    it.todo('Too Many Request');
  });
  describe.only('Register', () => {
    it('Success', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/mail-code?email=admin@no-reply.com')
        .send();
      expect(body.ttl).toBeGreaterThan(0);
      const code = await redis.get(AUTH_EMAIL_CODE('admin@no-reply.com'));
      expect(code).toBeDefined();
      const { statusCode, body: b2 } = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          code,
          email: 'admin@no-reply.com',
          password: 'admin',
          profile: {
            nick: 'admin',
          },
        } as Register);
      expect(statusCode).toBe(HttpStatus.CREATED);
      expect(b2.profile.id).toBeDefined();
    });
    it('User exist', async () => {
      const { badRequest } = await request(app.getHttpServer())
        .post('/auth/mail-code?email=test@no-reply.com')
        .send();
      expect(badRequest).toBe(true);
    });
  });
  describe('Refresh Token', () => {
    it.todo('Invalid Refresh Token');
    it.todo('Refresh Token Expire');
    it.todo('Client secret invalid');
    it.todo('Success');
  });
});
