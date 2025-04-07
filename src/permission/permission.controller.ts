import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Auth, BigIntPipe, Permission } from '@app/decorator';
import { CreatePermission } from './dto/create-permission';
import { UpdatePermission } from './dto/update-permission';
import { Permission as PermissionDTO } from '@prisma/client';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Auth()
  @Permission(['PERMISSION::GET::LIST'])
  @Get('/')
  async getPermissionList(
    @Query('clientId') clientId: string,
    @Query('size', new DefaultValuePipe(10), new ParseIntPipe({})) size: number,
    @Query('preId', new BigIntPipe({ optional: true })) id?: bigint,
  ) {
    return this.permissionService.getPermissionList(id, clientId, size);
  }

  @Auth()
  @Permission(['PERMISSION::CREATE'])
  @Post('/')
  async createPermission(
    @Body() body: CreatePermission,
  ): Promise<PermissionDTO> {
    return this.permissionService.createPermission(body);
  }

  @Auth()
  @Permission(['PERMISSION::REMOVE'])
  @Delete('/:id')
  removePermission(
    @Param('id', BigIntPipe) id: bigint,
    @Query('clientId') clientId: string,
  ) {
    return this.permissionService.removePermission(id, clientId);
  }

  @Auth()
  @Permission(['PERMISSION::UPDATE'])
  @Patch('/:id')
  updatePermission(
    @Param('id', BigIntPipe) id: bigint,
    @Query('clientId') clientId: string,
    @Body() body: UpdatePermission,
  ) {
    return this.permissionService.updatePermission(id, clientId, body);
  }

  @Auth()
  @Permission(['PERMISSION::GET'])
  @Get('/:id')
  getPermissionInfo(
    @Param('id', BigIntPipe) id: bigint,
    @Query('clientId') clientId: string,
  ) {
    return this.permissionService.getPermissionInfo(id, clientId);
  }
}
