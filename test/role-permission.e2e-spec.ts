import {
  getRedisToken,
  DEFAULT_REDIS_NAMESPACE,
} from '@liaoliaots/nestjs-redis';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { clear } from './utils/setup';
import Redis from 'ioredis';
import { AppModule } from '../src/app.module';
import { createUser } from './utils/create-user';
import { createClient } from './utils/create-client';
import { login } from './utils/login';
import request from 'supertest';
import { CreatePermission } from 'src/permission/dto/create-permission';
import { Client, Permission } from '@prisma/client';
import { createPermission } from './utils/create-permission';
import { UpdatePermission } from 'src/permission/dto/update-permission';
import { CreateRole } from 'src/role/dto/create-role.dto';
import { RoleService } from '../src/role/role.service';
import { CreateClient } from 'src/client/dto/create-client';

/**
 * @description Role 和 Permission 几乎不会独立出现. 这里直接混合测试了.
 */
describe('Role And Permission end to end test', () => {
  let app: INestApplication;
  let redis: Redis;
  let service: RoleService;
  const createTestClient = async (name: string, administrator: bigint[]) => {
    const client = await createClient(
      {
        name,
        desc: name,
        redirect: 'http://example.org',
        administrator,
      } as CreateClient,
      app,
    );
    return client;
  };
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    redis = app.get(getRedisToken(DEFAULT_REDIS_NAMESPACE));
    service = app.get(RoleService);
    await clear('sqlite');
    await redis.flushdb();
    await app.init();
    expect(redis).toBeDefined();
    await createUser(app, redis, 'test@no-reply.com', 'test');
  });
  describe('Permission', () => {
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
    describe('Create Permission', () => {
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
              name: 'TEST::2::PERMISSION',
              desc: 'TEST::2::PERMISSION',
              clientId: client.clientId,
            } as CreatePermission);
          const p = body as Permission;
          expect(statusCode).toBe(HttpStatus.CREATED);
        }
      });
    });
    describe('Remove Permission', () => {
      it('Should succes', async () => {
        const client = await createTestClient('test-a');
        const permission = await createPermission(
          'test-permission',
          client.clientId,
          app,
        );
        const { statusCode } = await request(app.getHttpServer())
          .del(`/permission/${permission.id}`)
          .query({ clientId: client.clientId })
          .auth(tokenPair.admin.access, { type: 'bearer' });
        expect(statusCode).toBe(HttpStatus.OK);
      });
      it('Should return 403', async () => {
        const client = await createTestClient('test-a');
        const permission = await createPermission(
          'test-permission',
          client.clientId,
          app,
        );
        const { statusCode } = await request(app.getHttpServer())
          .del(`/permission/${permission.id}`)
          .query({ clientId: client.clientId })
          .auth(tokenPair.test.access, { type: 'bearer' });
        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
      });
      it('Should return 404, because permission not found', async () => {
        const client = await createTestClient('test-a');
        const { statusCode } = await request(app.getHttpServer())
          .del(`/permission/114514`)
          .query({ clientId: client.clientId })
          .auth(tokenPair.admin.access, { type: 'bearer' });
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
      });
    });
    describe('Update Permission', () => {
      it('Should succes', async () => {
        const client = await createTestClient('test-a');
        const permission = await createPermission(
          'test-permission',
          client.clientId,
          app,
        );
        const { statusCode, body } = await request(app.getHttpServer())
          .patch(`/permission/${permission.id}`)
          .query({ clientId: client.clientId })
          .auth(tokenPair.admin.access, { type: 'bearer' })
          .send({
            name: 'Test-2',
          } as UpdatePermission);

        expect(body.name).not.toBe(permission.name);
        expect(body.desc).toBe(permission.desc);
        expect(statusCode).toBe(HttpStatus.OK);
      });
      it('Should return 403', async () => {
        const client = await createTestClient('test-a');
        const permission = await createPermission(
          'test-permission',
          client.clientId,
          app,
        );
        const { statusCode } = await request(app.getHttpServer())
          .patch(`/permission/${permission.id}`)
          .query({ clientId: client.clientId })
          .auth(tokenPair.test.access, { type: 'bearer' })
          .send({
            name: 'Test-2',
          } as UpdatePermission);
        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
      });
      it('Should return 404, because permission not found', async () => {
        const { statusCode } = await request(app.getHttpServer())
          .patch(`/permission/114514`)
          .query({ clientId: process.env.CLIENT_ID })
          .auth(tokenPair.admin.access, { type: 'bearer' })
          .send({
            name: 'Test-2',
          } as UpdatePermission);
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
      });
    });
    describe('Get Permission Info', () => {
      it('Should succes', async () => {
        const p = await createPermission('test', process.env.CLIENT_ID, app);
        const { statusCode, body } = await request(app.getHttpServer())
          .get(`/permission/${p.id}`)
          .query({ clientId: process.env.CLIENT_ID })
          .auth(tokenPair.admin.access, { type: 'bearer' });
        expect(statusCode).toBe(HttpStatus.OK);
        expect(body.id).toBe(p.id.toString());
        expect(body.name).toBe(p.name);
      });
      it('Should return 403', async () => {
        const p = await createPermission('test', process.env.CLIENT_ID, app);
        const { statusCode } = await request(app.getHttpServer())
          .get(`/permission/${p.id}`)
          .query({ clientId: process.env.CLIENT_ID })
          .auth(tokenPair.test.access, { type: 'bearer' });
        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
      });
      it('Should return 404, because permission not found', async () => {
        const { statusCode, body } = await request(app.getHttpServer())
          .get(`/permission/800`)
          .query({ clientId: process.env.CLIENT_ID })
          .auth(tokenPair.admin.access, { type: 'bearer' });
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
      });
    });
    describe('Get Permission List', () => {
      beforeEach(async () => {
        for (let i = 0; i < 20; i++) {
          await createPermission(`permission-${i}`, process.env.CLIENT_ID, app);
        }
      });
      it('Should succes', async () => {
        const { statusCode, body } = await request(app.getHttpServer())
          .get('/permission')
          .query({
            clientId: process.env.CLIENT_ID,
          })
          .auth(tokenPair.admin.access, { type: 'bearer' });
        expect(statusCode).toBe(HttpStatus.OK);
        expect(body.data).toHaveLength(20);
        const { body: b2 } = await request(app.getHttpServer())
          .get('/permission')
          .query({
            clientId: process.env.CLIENT_ID,
            preId: body.data.at(-1).id,
          })
          .auth(tokenPair.admin.access, { type: 'bearer' });
        const id1 = body.data.map((item) => item.id) as string[];
        const id2 = b2.data.map((item) => item.id) as string[];
        expect(id2.every((id) => id1.includes(id))).toBe(false);
      });
      it('Should return 403', async () => {
        const { statusCode } = await request(app.getHttpServer())
          .get('/permission')
          .query({
            clientId: process.env.CLIENT_ID,
          })
          .auth(tokenPair.test.access, { type: 'bearer' });
        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
      });
    });
  });
  describe.skip('Role', () => {
    type MinialAccount = { id: bigint; email: string };
    let userA: MinialAccount,
      userB: MinialAccount,
      clientA: Client,
      clientB: Client;
    const tokens = {
      a: '',
      b: '',
      admin: '',
    };
    beforeEach(async () => {
      userA = await createUser(app, redis, 'admin-a@no-reply.com', 'admin');
      userB = await createUser(app, redis, 'admin-b@no-reply.com', 'admin');
      clientA = await createTestClient('client-a', [userA.id]);
      clientB = await createTestClient('client-b', [userB.id]);
      tokens.a = (
        await login('admin-a@no-reply.com', 'admin', process.env.CLIENT_ID, app)
      ).access_token;
      tokens.b = (
        await login('admin-b@no-reply.com', 'admin', process.env.CLIENT_ID, app)
      ).access_token;
      tokens.admin = (
        await login('admin@no-reply.com', 'admin', process.env.CLIENT_ID, app)
      ).access_token;
    });
    describe('Create Role', () => {
      it('Success', async () => {
        const { statusCode } = await request(app.getHttpServer())
          .post('/role')
          .auth(tokens.a, { type: 'bearer' })
          .send({
            name: 'TestA',
            desc: 'TestA',
            permissions: [],
            clientId: clientA.clientId,
          } satisfies CreateRole);
        expect(statusCode).toBe(HttpStatus.CREATED);
      });
      it.only('Fail, Not a client administrator', async () => {
        const { statusCode, body } = await request(app.getHttpServer())
          .post('/role')
          .auth(tokens.a, { type: 'bearer' })
          .send({
            name: 'TestA',
            desc: 'TestA',
            permissions: [],
            clientId: clientB.clientId,
          });
        console.log(body);
        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
      });
      it.todo(
        'Success,Even if not a client administrator, having ROLE::CREATE::* permission',
      );
    });
    describe('RemoveRole', () => {
      it.todo('Success');
      it.todo('Fail, Not a client administrator');
      it.todo(
        'Success,Even if not a client administrator, having ROLE::REMOVE::*  permission',
      );
    });
    describe('UpdateRole', () => {
      it.todo('Success');
      it.todo(
        'Success,Even if not a client administrator, having ROLE::REMOVE::*  permission',
      );
      it.todo(
        'Success, Migration to another client, even if not an administrator of the other client, but with ROLE::UPDATE::*::PERMISSION',
      );
      it.todo('Fail, Not a client administrator');
      it.todo(
        'Fail, Migration to another client, but not an administrator of the other client',
      );
      it.todo('Fail, Parent not found');
      it.todo(
        'Fail, Parent exist, The parent exists on another client, but the client is not under the jurisdiction of the user',
      );
      it.todo('Fail, Permission not found');
    });
    describe('GetRoleInfo', () => {
      it.todo('Success');
      it.todo(
        'Success, Even if not a client administrator, having ROLE::QUERY::INFO::* permission',
      );
      it.todo('Fail, Not a client administer');
      it.todo('Fail, Client NotFound');
    });
  });
});
