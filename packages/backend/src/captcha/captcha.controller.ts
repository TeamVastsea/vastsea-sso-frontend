import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { ValidateDto } from './dto/validate.dto';
import { ConfigService } from '@app/config';

@Controller('captcha')
export class CaptchaController {
  constructor(
    private readonly captchaService: CaptchaService,
    private readonly config: ConfigService,
  ) {}

  @Get('/valid')
  valid(@Query() dto: ValidateDto) {
    return this.captchaService.valid(dto).then((resp) => {
      if (resp.status === 'error') {
        throw new HttpException('上游错误', HttpStatus.BAD_REQUEST);
      }
      if (resp.result === 'fail') {
        throw new HttpException(resp.reason, HttpStatus.BAD_REQUEST);
      }
      return;
    });
  }
  @Get('should-show')
  shouldShow(@Query('url') url: string) {
    const map: Record<string, boolean> = this.config.get('captcha.map' as any);
    return {
      should: Boolean(map[url]),
    };
  }
}
