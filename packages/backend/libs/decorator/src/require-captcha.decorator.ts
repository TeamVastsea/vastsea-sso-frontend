import { SetMetadata } from '@nestjs/common';

export const RequriedCaptchaKey = Symbol('captcha');

export const RequriedCaptcha = (type: 'geetest') =>
  SetMetadata(RequriedCaptchaKey, type);
