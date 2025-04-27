import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { clear } from './utils/setup';
import Redis from 'ioredis';
import {
  DEFAULT_REDIS_NAMESPACE,
  getRedisToken,
} from '@liaoliaots/nestjs-redis';
import { createUser } from './utils/create-user';
import request from 'supertest';
import { login } from './utils/login';
import { UpdateProfile } from 'src/profile/dto/update-dto';

describe('Profile', () => {
  let app: INestApplication;
  let redis: Redis;
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    redis = app.get(getRedisToken(DEFAULT_REDIS_NAMESPACE));
    await clear('sqlite');
    await redis.flushdb();
    await app.init();
    await createUser(app, redis, 'test@no-reply.com', 'test');
  });
  const tokenPair = {
    admin: { access: '' },
    test: { access: '' },
  };
  beforeEach(async () => {
    const { access_token: admin } = await login(
      'admin@no-reply.com',
      'admin',
      process.env.CLIENT_ID,
      app,
    );
    const { access_token: test } = await login(
      'test@no-reply.com',
      'test',
      process.env.CLIENT_ID,
      app,
    );
    tokenPair.admin.access = admin;
    tokenPair.test.access = test;
  });

  it('Get Profile (Param)', async () => {
    const { body, statusCode } = await request(app.getHttpServer()).get(
      '/profile/10001',
    );
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body.nick).toBe('Admin');
  });

  it('Patch Profile', async () => {
    const { body } = await request(app.getHttpServer()).get('/profile/10001');
    await request(app.getHttpServer())
      .patch('/profile')
      .auth(tokenPair.admin.access, { type: 'bearer' })
      .send({
        desc: 'desc',
      } as UpdateProfile);
    const { body: b2 } = await request(app.getHttpServer()).get(
      '/profile/10001',
    );
    expect(body.desc).not.toBe(b2.desc);
    expect(body.nick).toBe(b2.nick);
  });
});
