import { Get } from '@nestjs/common';

export class AppController {
  @Get('/health')
  health() {
    return {
      COMMIT: __COMMIT__,
      BUILD_AT: __BUILD_AT__,
    };
  }
}
