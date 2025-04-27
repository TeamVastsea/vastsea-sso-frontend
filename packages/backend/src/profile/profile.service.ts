import { Injectable } from '@nestjs/common';
import { UpdateProfile } from './dto/update-dto';
import { PrismaService } from '@app/prisma';
import { isNil, not } from 'ramda';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}
  updateProfile(id: bigint, data: UpdateProfile) {
    return this.prisma.profile
      .update({
        where: {
          accountId: id,
        },
        data,
      })
      .then((profile) => profile);
  }
  getProfile(id: bigint) {
    return this.prisma.profile.findFirst({
      where: { accountId: id },
    });
  }
  profileExists(id: bigint) {
    return this.prisma.profile
      .findFirst({
        where: { accountId: id },
        select: { id: true },
      })
      .then(isNil)
      .then(not);
  }
}
