import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ProfileModule } from '../profile/profile.module';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  imports: [ProfileModule],
})
export class UploadModule {}
