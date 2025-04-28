import {
  Controller,
  Delete,
  HttpException,
  HttpStatus,
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

export const DEFAULT_PATH = `./assets/images`;

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
    const filePath = this.uploadService.resolvePath(
      this.config.get('file.avatar.profile.path') ?? DEFAULT_PATH,
      hash,
    );
    const oldProfile = await this.profileService.getProfile(_id);
    if (!oldProfile) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
    if (oldProfile.avatar && !oldProfile.avatar?.endsWith(hash)) {
      await this.uploadService.unrefFile(oldProfile.avatar.split('/').at(-1)!);
    }
    await this.uploadService.storageFile(
      this.uploadService.resolveStorageParam(file, filePath, hash),
    );
    await this.profileService.updateProfile(_id, {
      avatar: `/images/avatar/profile/${hash}`,
    });
    return {
      path: `/images/avatar/profile/${hash}`,
    };
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
    const filePath = this.uploadService.resolvePath(
      this.config.get('file.avatar.client.path') ?? DEFAULT_PATH,
      hash,
    );

    const oldClientInfo = await this.clientService.findClient({ id });
    if (oldClientInfo && !oldClientInfo.avatar?.endsWith(hash)) {
      const hash = oldClientInfo.avatar?.split('/').at(-1);
      if (hash) {
        await this.uploadService.unrefFile(hash);
      }
    }

    await this.uploadService.storageFile(
      this.uploadService.resolveStorageParam(file, filePath, hash),
    );
    await this.clientService.updateClient(
      id,
      {
        avatar: `/images/avatar/profile/${hash}`,
      },
      -1n,
      true,
    );
    return {
      path: `/images/avatar/client/${hash}`,
    };
  }

  @Permission(['REMOVE::IMAGE::*'])
  @Auth()
  @Delete(':hash')
  async removeImage(@Param('hash') hash: string) {
    return this.uploadService.removeFile(hash);
  }
}
