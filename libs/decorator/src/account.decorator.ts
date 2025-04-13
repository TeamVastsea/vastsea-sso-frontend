import { createParamDecorator } from '@nestjs/common';

export const Account = createParamDecorator(
  (data: keyof AuthReq['user'], ctx) => {
    const http = ctx.switchToHttp();
    const req = http.getRequest();
    return req.user[data];
  },
);
