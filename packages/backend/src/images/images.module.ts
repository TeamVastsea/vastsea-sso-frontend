import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  controllers: [ImagesController],
  imports: [UploadModule],
})
export class ImagesModule {}
