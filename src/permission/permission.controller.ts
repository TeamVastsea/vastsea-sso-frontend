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
import { BigIntPipe } from '@app/decorator';
import { CreatePermission } from './dto/create-permission';
import { UpdatePermission } from './dto/update-permission';
import { Permission } from './dto/permission';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('/')
  async getPermissionList(
    @Query('clientId') clientId: string,
    @Query('size', new DefaultValuePipe(10), new ParseIntPipe({})) size: number,
    @Query('id', new BigIntPipe({ optional: true })) id?: bigint,
  ) {
    return this.permissionService.getPermissionList(id, clientId, size);
  }
  @Post('/')
  async createPermission(@Body() body: CreatePermission): Promise<Permission> {
    return this.permissionService.createPermission(body);
  }

  @Delete('/:id')
  removePermission(
    @Param('id', BigIntPipe) id: bigint,
    @Query('clientId') clientId: string,
  ) {
    return this.permissionService.removePermission(id, clientId);
  }

  @Patch('/:id')
  updatePermission(
    @Param('id', BigIntPipe) id: bigint,
    @Query('clientId') clientId: string,
    @Body() body: UpdatePermission,
  ) {
    return this.permissionService.updatePermission(id, clientId, body);
  }

  @Get('/:id')
  getPermissionInfo(
    @Param('id', BigIntPipe) id: bigint,
    @Query('clientId') clientId: string,
  ) {
    return this.permissionService.getPermissionInfo(id, clientId);
  }
}
