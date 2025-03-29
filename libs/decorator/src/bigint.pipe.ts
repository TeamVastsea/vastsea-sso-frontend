import {
  PipeTransform,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class BigIntPipe implements PipeTransform {
  transform(value: any) {
    return z
      .bigint({ coerce: true })
      .safeParseAsync(value)
      .then((ret) => {
        if (!ret.success) {
          throw new HttpException(
            ret.error.issues[0].message,
            HttpStatus.BAD_REQUEST,
          );
        }
        return ret.data;
      });
  }
}
