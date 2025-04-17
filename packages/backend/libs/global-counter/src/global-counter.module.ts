import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { GlobalCounterService } from './global-counter.service';
import { ID_COUNTER } from '@app/constant';
import { ConfigurableModuleClass } from './global-counter.option';

@Module({
  providers: [GlobalCounterService],
  exports: [GlobalCounterService],
})
export class GlobalCounterModule
  extends ConfigurableModuleClass
  implements OnModuleInit
{
  private logger = new Logger();
  constructor(private service: GlobalCounterService) {
    super();
  }
  async onModuleInit() {
    const initDatas = Object.values(ID_COUNTER)
      .map((value) => {
        return {
          [value]: [1, 1],
        };
      })
      .reduce((pre, cur) => {
        return {
          ...pre,
          ...cur,
        };
      }, {});
    initDatas[ID_COUNTER.ACCOUNT] = [10000, 1];
    for (const [key, [start, step]] of Object.entries(initDatas)) {
      if (await this.service.exists(key)) {
        this.logger.debug(`计数器 ${key} 存在`);
        continue;
      }
      await this.service.register(key, start, step);
      this.logger.debug(`计数器 ${key} 注册成功`);
    }
  }
}
