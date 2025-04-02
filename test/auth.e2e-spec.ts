import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { clear } from './utils/setup';

describe('Auth E2E test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await clear('sqlite');
    await app.init();
  });

  describe('Login', () => {
    it.todo('should redirect to client redirect');
    it.todo('should redirect to redirect query, because client not found');
    it.todo(
      'should redirect to common error redirect, because client not found and `redirect` query is undefined',
    );
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
  describe('Register', () => {
    it.todo('Success');
    it.todo('User exist');
  });
  describe('Refresh Token', () => {
    it.todo('Invalid Refresh Token');
    it.todo('Refresh Token Expire');
    it.todo('Client secret invalid');
    it.todo('Success');
  });
});
