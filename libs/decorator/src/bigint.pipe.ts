import {
  PipeTransform,
  Injectable,
  HttpException,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { z } from 'zod';

export type BigIntPipeOptions = {
  optional?: boolean;
};

@Injectable()
export class BigIntPipe implements PipeTransform {
  constructor(
    @Optional() private options: BigIntPipeOptions = { optional: false },
  ) {}
  transform(value: any) {
    if (!value && this.options.optional) {
      return;
    }
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
