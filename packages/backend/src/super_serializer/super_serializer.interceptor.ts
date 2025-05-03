import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';
import SuperJSON from '@gaonengwww/superjson';

@Injectable()
export class SuperSerializerInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (context.switchToHttp().getRequest().headers['x-meta']) {
          return SuperJSON.serialize(data);
        }
        return SuperJSON.serialize(data).json;
      }),
    );
  }
}
