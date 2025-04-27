import {
  Controller,
  Delete,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ConfigService } from '@app/config';
import { Account, Auth, BigIntPipe, Permission } from '@app/decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from '../profile/profile.service';
import { ClientService } from '../client/client.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly config: ConfigService,
    private readonly profileService: ProfileService,
    private readonly clientService: ClientService,
  ) {}

  @Auth()
  @Post('/profile/avatar')
  @UseInterceptors(
    FileInterceptor('profile', { limits: { files: 1, fileSize: 2000000 } }),
  )
  async uploadProfileAvatar(
    @Account('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const _id = BigInt(id);
    const hash = this.uploadService.getFileHash(file.buffer);
    const path = this.uploadService.resolvePath(
      this.config.get('file.avatar.profile.path') ?? `/public/${__dirname}`,
      file.filename,
    );
    await this.uploadService.storageFile(
      this.uploadService.resolveStorageParam(file, path, hash),
    );
    await this.profileService.updateProfile(_id, {
      avatar: path,
    });
    return hash;
  }

  @Permission(['UPDATE::CLIENT'])
  @Auth()
  @Post('')
  @UseInterceptors(
    FileInterceptor('image', { limits: { files: 1, fileSize: 2000000 } }),
  )
  async uploadClientAvatar(
    @Query('id', BigIntPipe) id: bigint,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const hash = this.uploadService.getFileHash(file.buffer);
    const path = this.uploadService.resolvePath(__dirname, `/public/image`);
    const clientAvatarPath = await this.uploadService
      .storageFile(this.uploadService.resolveStorageParam(file, path, hash))
      .then((hash) => {
        return `/image/${hash}`;
      });
    await this.clientService.updateClient(
      id,
      {
        avatar: clientAvatarPath,
      },
      -1n,
      true,
    );
  }

  @Permission(['REMOVE::IMAGE::*'])
  @Auth()
  @Delete(':hash')
  async removeImage(@Param('hash') hash: string) {
    return this.uploadService.removeFile(hash);
  }
}
