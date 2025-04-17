import { applyDecorators } from '@nestjs/common';

export const ApplyDecorator = (
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) => applyDecorators(...decorators);
