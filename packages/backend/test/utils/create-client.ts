import { CreateClient } from '../../src/client/dto/create-client';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { login } from './login';
import request from 'supertest';
import { Client } from '@prisma/client';

export const createClient = async (
  data: CreateClient,
  app: INestApplication,
) => {
  const { access_token } = await login(
    'admin@no-reply.com',
    'admin',
    process.env.CLIENT_ID,
    app,
  );
  const { statusCode, body } = await request(app.getHttpServer())
    .post('/client/')
    .auth(access_token, { type: 'bearer' })
    .send({
      ...data,
    } as CreateClient);
  expect(statusCode).toBe(HttpStatus.CREATED);
  return body as Client;
};
