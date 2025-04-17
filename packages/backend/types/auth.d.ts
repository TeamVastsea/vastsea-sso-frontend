import { Request } from 'express';

export {};

declare global {
  type AccessTokenPayload = {
    id: string;
  };
  type AuthReq = {
    user: { id: string; permissions: string[]; super: boolean };
  } & Request;
}
