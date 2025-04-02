import { AUTH_EMAIL_CODE } from '@app/constant';
import { INestApplication } from '@nestjs/common';
import Redis from 'ioredis';
import { Register } from '../../src/auth/dto/register.dto';
import request from 'supertest';

export const createUser = async (
  app: INestApplication,
  redis: Redis,
  email: string,
  password: string,
) => {
  const { body } = await request(app.getHttpServer())
    .post(`/auth/mail-code?email=${email}`)
    .send();
  expect(body.ttl).toBeGreaterThan(0);
  const code = await redis.get(AUTH_EMAIL_CODE(email));
  expect(code).toBeDefined();
  const { body: b2 } = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      code,
      email,
      password,
      profile: {
        nick: email,
      },
    } as Register);
  return b2;
};
