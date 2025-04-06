import {
  DEFAULT_REDIS_NAMESPACE,
  getRedisToken,
} from '@liaoliaots/nestjs-redis';
import { createUser } from './utils/create-user';
import { clear } from './utils/setup';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import Redis from 'ioredis';
import { Test } from '@nestjs/testing';

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

  describe('Create Client', () => {
    it.todo('Success');
    it.todo('Fail, Permision deined');
  });
  describe('Update Client', () => {
    it.todo('Success');
    it.todo('Client Not found');
    it.todo('Fail, Permision deined');
  });
  describe('Remove Client', () => {
    it.todo('Success');
    it.todo('Client Not found');
    it.todo('Fail, Permision deined');
  });
  describe('Get Client Info', () => {
    it.todo('Success');
    it.todo('Client Not found');
    it.todo('Fail, Permision deined');
  });
  describe('Get Client List', () => {
    it.todo('Success');
    it.todo('Client Not found');
    it.todo('Fail, Permision deined');
  });
});
