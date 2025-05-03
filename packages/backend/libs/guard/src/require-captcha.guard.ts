import { RequriedCaptchaKey } from '@app/decorator';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { CaptchaService } from '../../../src/captcha/captcha.service';
import { Request } from 'express';
import { validate } from '../../../src/captcha/dto/validate.dto';

@Injectable()
export class RequiredCaptchaGuard implements CanActivate {
  constructor(
    private ref: Reflector,
    private service: CaptchaService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const type = this.ref.getAllAndOverride(RequriedCaptchaKey, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!type || __TEST__) {
      return true;
    }
    const http = context.switchToHttp();
    const req: Request = http.getRequest();
    const lot_number = req.query.lot_number;
    const captcha_output = req.query.captcha_output;
    const pass_token = req.query.pass_token;
    const gen_time = req.query.gen_time;
    const dto = { lot_number, captcha_output, pass_token, gen_time };
    const { data, error } = validate.safeParse(dto);
    if (error) {
      throw new HttpException(error.errors[0].message, HttpStatus.BAD_REQUEST);
    }

    return this.service.valid(data).then((resp) => {
      if (resp.status === 'error') {
        throw new HttpException(resp.msg, HttpStatus.BAD_REQUEST);
      }
      if (resp.status === 'success' && resp.result === 'fail') {
        throw new HttpException(resp.reason, HttpStatus.BAD_REQUEST);
      }
      return true;
    });
  }
}
