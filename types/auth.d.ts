import { Request } from 'express';

export {};

declare global {
  type AccessTokenPayload = {
    id: string;
  };
  type AuthReq = {
    user: { id: string };
  } & Request;
}
