import { HttpStatus, INestApplication } from '@nestjs/common';
import { LoginDto } from '../../src/auth/dto/login.dto';
import request from 'supertest';
import { TokenPayload } from '../../src/auth/dto/token-pair.dto';

export const getToken = async (
  code: string,
  clientId: string,
  clientSecret: string,
  app: INestApplication,
) => {
  const { body, statusCode } = await request(app.getHttpServer())
    .get('/auth/token')
    .query({ code, clientId, clientSecret });
  expect(statusCode).toBe(HttpStatus.OK);
  const pair = body as TokenPayload;
  return pair;
};

export const getCode = async (
  data: LoginDto,
  clientId: string,
  app: INestApplication,
) => {
  const { statusCode, headers } = await request(app.getHttpServer())
    .post('/auth/login')
    .send(data)
    .query({
      clientId,
    });
  expect(statusCode).toBe(HttpStatus.FOUND);
  expect(headers['location']).toBeDefined();
  const url = new URL(headers['location']);
  expect(url.searchParams.get('code')).toBeDefined();
  expect(url.searchParams.get('ok')).toBe('true');
  return {
    code: url.searchParams.get('code'),
  };
};
