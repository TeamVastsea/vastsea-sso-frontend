import { Inject, Injectable } from '@nestjs/common';
import GetTypeByTemplate, {
  ConfigOptions,
  ConfigTemplate,
  MODULE_OPTIONS_TOKEN,
} from './config.option';

@Injectable()
export class ConfigService {
  private configure: Configure;
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private configureOptions: ConfigOptions,
  ) {
    const { loader } = this.configureOptions;
    this.configure = loader();
  }
  get<T extends ConfigTemplate>(path: T): GetTypeByTemplate<T> | null {
    const paths = path.split('.');
    let _configure = this.configure;
    for (const path of paths) {
      if (_configure[path]) {
        _configure = _configure[path];
        continue;
      }
      return null;
    }
    return _configure as unknown as GetTypeByTemplate<T>;
  }
}
