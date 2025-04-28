import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { UploadService } from '../upload/upload.service';
import { ConfigService } from '@app/config';
import { isEmpty } from 'ramda';
import { createReadStream, existsSync } from 'fs';

@Controller('images')
export class ImagesController {
  constructor(
    private uploadService: UploadService,
    private config: ConfigService,
  ) {}
  @Get('/*/:hash')
  async getImage(@Param('hash') hash: string) {
    const meta = await this.uploadService.getFileMeta(hash);
    if (isEmpty(meta)) {
      throw new HttpException('图片不存在', HttpStatus.NOT_FOUND);
    }
    const path = meta.path;
    if (existsSync(path)) {
      const file = createReadStream(path);
      return new StreamableFile(file, { type: 'image/webp' });
    }
  }
}
