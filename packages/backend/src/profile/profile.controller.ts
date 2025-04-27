import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Account, Auth } from '@app/decorator';
import { UpdateProfile } from './dto/update-dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id')
  async getProfile(@Param('id') paramId: string) {
    const profile = await this.profileService.getProfile(BigInt(paramId));
    if (!profile) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    return profile;
  }

  @Auth()
  @Patch('')
  async updateProfile(@Account('id') id: string, @Body() data: UpdateProfile) {
    const profileExists = await this.profileService.profileExists(BigInt(id));
    if (!profileExists) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    return this.profileService.updateProfile(BigInt(id), data);
  }
}
