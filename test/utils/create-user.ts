import { AUTH_EMAIL_CODE } from '@app/constant';
import { INestApplication } from '@nestjs/common';
import Redis from 'ioredis';
import { CreateAccount } from '../../src/account/dto/create-account';
import request from 'supertest';

export const createUser = async (
  app: INestApplication,
  redis: Redis,
  email: string,
  password: string,
) => {
  await request(app.getHttpServer())
    .post(`/account/mail-code?email=${email}`)
    .send();
  const code = await redis.get(AUTH_EMAIL_CODE(email));
  expect(code).toBeDefined();
  const { body: b2 } = await request(app.getHttpServer())
    .post('/account')
    .send({
      code,
      email,
      password,
      profile: {
        nick: email,
      },
    } as CreateAccount);
  return b2;
};
