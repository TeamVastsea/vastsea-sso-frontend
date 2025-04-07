import {
  getRedisToken,
  DEFAULT_REDIS_NAMESPACE,
} from '@liaoliaots/nestjs-redis';
import { HttpStatus, INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { clear } from './utils/setup';
import Redis from 'ioredis';
import { AppModule } from '../src/app.module';
import { createUser } from './utils/create-user';
import { createClient } from './utils/create-client';
import { ClientService } from '../src/client/client.service';
import { login } from './utils/login';
import request from 'supertest';
import { CreatePermission } from 'src/permission/dto/create-permission';
import { Permission } from '@prisma/client';

/**
 * @description Role 和 Permission 几乎不会独立出现. 这里直接混合测试了.
 */
describe('Role And Permission end to end test', () => {
  let app: INestApplication;
  let redis: Redis;
  const createTestClient = async (name: string) => {
    const client = await createClient(
      {
        name,
        desc: name,
        redirect: '',
      },
      app.get(ClientService),
    );
    return client;
  };
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .setLogger(new Logger())
      .compile();
    app = moduleFixture.createNestApplication();

    redis = app.get(getRedisToken(DEFAULT_REDIS_NAMESPACE));
    await clear('sqlite');
    await redis.flushdb();
    await app.init();
    expect(redis).toBeDefined();
    await createUser(app, redis, 'test@no-reply.com', 'test');
  });
  describe('Permission', () => {
    describe('Create Permission', () => {
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
      it('Should success', async () => {
        const client = await createTestClient('test-a');
        const { statusCode, body } = await request(app.getHttpServer())
          .post('/permission')
          .auth(tokenPair.admin.access, { type: 'bearer' })
          .send({
            name: 'TEST::PERMISSION',
            desc: 'TEST::PERMISSION',
            clientId: client.clientId,
          } as CreatePermission);
        const p = body as Permission;
        expect(p.clientId).toBe(client.clientId);
        expect(p.clientId).not.toBe(process.env.CLIENT_ID);
        expect(statusCode).toBe(HttpStatus.CREATED);
      });
      it('Should return 403', async () => {
        const client = await createTestClient('test-a');
        const { statusCode } = await request(app.getHttpServer())
          .post('/permission')
          .auth(tokenPair.test.access, { type: 'bearer' })
          .send({
            name: 'TEST::PERMISSION',
            desc: 'TEST::PERMISSION',
            clientId: client.clientId,
          } as CreatePermission);
        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
      });
      it('Should return 400, because require ClientId but receive undefined', async () => {
        const { statusCode } = await request(app.getHttpServer())
          .post('/permission')
          .auth(tokenPair.admin.access, { type: 'bearer' })
          .send({
            name: 'TEST::PERMISSION',
            desc: 'TEST::PERMISSION',
          } as CreatePermission);
        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      });
      it('Should return 400, because permission exists', async () => {
        const client = await createTestClient('test-a');
        const { statusCode, body } = await request(app.getHttpServer())
          .post('/permission')
          .auth(tokenPair.admin.access, { type: 'bearer' })
          .send({
            name: 'TEST::PERMISSION',
            desc: 'TEST::PERMISSION',
            clientId: client.clientId,
          } as CreatePermission);
        const { statusCode: s2 } = await request(app.getHttpServer())
          .post('/permission')
          .auth(tokenPair.admin.access, { type: 'bearer' })
          .send({
            name: 'TEST::PERMISSION',
            desc: 'TEST::PERMISSION',
            clientId: client.clientId,
          } as CreatePermission);
        const p = body as Permission;
        expect(p.clientId).toBe(client.clientId);
        expect(p.clientId).not.toBe(process.env.CLIENT_ID);
        expect(statusCode).toBe(HttpStatus.CREATED);
        expect(s2).toBe(HttpStatus.BAD_REQUEST);
      });
      it('should return 200, Even if permissions exist, they are not in the same client', async () => {
        const clients = [
          await createTestClient('test-a'),
          await createTestClient('test-b'),
        ];
        for (const client of clients) {
          const { statusCode, body } = await request(app.getHttpServer())
            .post('/permission')
            .auth(tokenPair.admin.access, { type: 'bearer' })
            .send({
              name: 'TEST::PERMISSION',
              desc: 'TEST::PERMISSION',
              clientId: client.clientId,
            } as CreatePermission);
          const p = body as Permission;
          console.log(p);
          expect(statusCode).toBe(HttpStatus.CREATED);
        }
      });
    });
    describe('Remove Permission', () => {
      it.todo('Should succes');
      it.todo('Should return 403');
      it.todo('Should return 404, because permission not found');
    });
    describe('Update Permission', () => {
      it.todo('Should succes');
      it.todo('Should return 403');
      it.todo('Should return 404, because permission not found');
    });
    describe('Get Permission Info', () => {
      it.todo('Should succes');
      it.todo('Should return 403');
      it.todo('Should return 404, because permission not found');
    });
    describe('Get Permission List', () => {
      it.todo('Should succes');
      it.todo('Should return 403');
    });
  });
  describe('Role', () => {
    describe('Create Role', () => {
      it.todo('Should Success');
      it.todo('Should return 403');
      it.todo('Should return 400, because role exists');
      it.todo(
        'Should success, even if role exist, they are not in the same client',
      );
    });
    describe('Remove Role', () => {
      it.todo('Should Success');
      it.todo('Should return 403');
      it.todo('Should return 404, because role not found');
      it.todo(
        'Should return 400, because The current role has been inherited by another role, and the child role needs to be deleted first',
      );
    });
    describe('Update Role', () => {
      it.todo('Should Success');
      it.todo('Should return 403');
      it.todo('Should return 404, current role not found');
      describe('Inheritance Role', () => {
        describe('Single inheritance', () => {
          it.todo('Should success. Get Role Info can get parent role info');
          it.todo('Should return 404, because parent is not found');
        });
        describe('Multiple Inheritance', () => {
          it.todo('Should success. Get Role Info can get parent roles info');
          it.todo('Should return 404, because parent is not found');
        });
      });
    });
    describe('Get Role Info', () => {
      it.todo('Should Success');
      it.todo('Should return 403');
      it.todo('Should return 404, role not found');
    });
    describe('Get Role List', () => {
      it.todo('Should Success');
      it.todo('Should return 403');
    });
  });
});
