import { INestApplication } from '@nestjs/common';
import Redis from 'ioredis';
import { AccountService } from '../../src/account/account.service';

export const createUser = async (
  app: INestApplication,
  redis: Redis,
  email: string,
  password: string,
) => {
  const service = app.get(AccountService);
  const body = service.createAccount({
    email,
    password,
    profile: {
      nick: email,
    },
  });
  return body;
};
