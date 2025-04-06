import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { clear } from './utils/setup';
import Redis from 'ioredis';
import {
  DEFAULT_REDIS_NAMESPACE,
  getRedisToken,
} from '@liaoliaots/nestjs-redis';
import { createUser } from './utils/create-user';
import { ClientService } from '../src/client/client.service';
import { createClient } from './utils/create-client';
import { Client } from '@prisma/client';
import request from 'supertest';
import { LoginDto } from 'src/auth/dto/login.dto';

describe('Auth E2E test', () => {
  let app: INestApplication;
  let redis: Redis;
  let clientService: ClientService;
  const clients: Client[] = [];
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();

    redis = app.get(getRedisToken(DEFAULT_REDIS_NAMESPACE));
    clientService = app.get(ClientService);
    await clear('sqlite');
    await app.init();
    expect(redis).toBeDefined();
    await createUser(app, redis, 'test@no-reply.com', 'test');
    const client = await createClient(
      {
        name: 'test',
        redirect: 'http://redirect.test.org',
      },
      clientService,
    );
    clients.push(client);
  });
  afterAll(async () => {
    await redis.flushdb();
  });

  describe('Login', () => {
    it('should redirect to client redirect', async () => {
      const { statusCode, header } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@no-reply.com',
          password: 'test',
        } as LoginDto)
        .query({
          clientId: clients[0].clientId,
        });
      expect(statusCode).toBe(HttpStatus.FOUND);
      const to = header.location;
      expect(to).toBeDefined();
      const url = new URL(to);
      expect(url.origin).toBe(clients[0].redirect);
      expect(url.searchParams.get('ok')).toBe('true');
      expect(url.searchParams.get('code')).toBeDefined();
    });
    it('should redirect to redirect query, because client not found', async () => {
      const { statusCode, header } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@no-reply.com',
          password: 'test',
        } as LoginDto)
        .query({
          clientId: 'not exists',
          redirect: 'http://example.org/',
        });
      expect(statusCode).toBe(HttpStatus.FOUND);
      const url = new URL(header.location);
      expect(url.href).toMatch('http://example.org/');
      expect(url.searchParams.get('ok')).toBe('false');
    });
    it('should redirect to common error redirect, because client not found and `redirect` query is undefined', async () => {
      const { statusCode, header } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@no-reply.com',
          password: 'test',
        } as LoginDto)
        .query({
          clientId: 'not exists',
        });
      expect(statusCode).toBe(HttpStatus.FOUND);
      const url = new URL(header.location);
      expect(url.href).toMatch(process.env.COMMON_ERROR_REDIRECT);
      expect(url.searchParams.get('ok')).toBe('false');
    });
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
  describe('Refresh Token', () => {
    it.todo('Invalid Refresh Token');
    it.todo('Refresh Token Expire');
    it.todo('Client secret invalid');
    it.todo('Success');
  });
});
