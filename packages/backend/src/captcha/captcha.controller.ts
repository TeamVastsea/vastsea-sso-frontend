import { Controller, HttpException, HttpStatus, Query } from '@nestjs/common';
import { CaptchaService } from './captcha.service';

@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  register(@Query('t') t: string) {
    this.captchaService.active().then((active) => {
      if (!active) {
        throw new HttpException(
          'Too Many Request',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    });
  }
}
