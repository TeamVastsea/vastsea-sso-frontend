import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { UploadService } from './upload.service';
import { DEFAULT_PATH, UploadController } from './upload.controller';
import { ProfileModule } from '../profile/profile.module';
import { ConfigService } from '@app/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  imports: [ProfileModule],
  exports: [UploadService],
})
export class UploadModule implements OnModuleInit {
  private logger: Logger = new Logger(UploadModule.name);
  constructor(
    private config: ConfigService,
    private service: UploadService,
  ) {}
  onModuleInit() {
    const clientAvatarRoot = join(
      __dirname,
      this.config.get('file.avatar.client.path') ?? DEFAULT_PATH,
    );
    const profileAvatarRoot = join(
      __dirname,
      this.config.get('file.avatar.profile.path') ?? DEFAULT_PATH,
    );
    if (!existsSync(clientAvatarRoot)) {
      this.logger.log(`Not found ${clientAvatarRoot}`);
      mkdirSync(clientAvatarRoot, { recursive: true });
      this.logger.log('Create success');
    }
    if (!existsSync(profileAvatarRoot)) {
      this.logger.log(`Not found ${profileAvatarRoot}`);
      mkdirSync(profileAvatarRoot, { recursive: true });
      this.logger.log('Create success');
    }
  }
}
