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
import { RoleService } from './role.service';
import { Auth, BigIntPipe, Permission } from '@app/decorator';
import { CreateRole } from './dto/create-role.dto';
import { UpdateRole } from './dto/update-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Auth()
  @Permission(['ROLE::CREATE'])
  @Post('/')
  async createRole(@Body() data: CreateRole) {
    return this.roleService.createRole(data);
  }

  @Auth()
  @Permission(['ROLE::REMOVE'])
  @Delete('/:id')
  async removeRole(@Param('id', BigIntPipe) id: bigint) {
    return this.roleService.removeRole(id);
  }

  @Auth()
  @Permission(['ROLE::UPDATE'])
  @Patch('/:id')
  async updateRole(
    @Param('id', BigIntPipe) id: bigint,
    @Body() data: UpdateRole,
  ) {
    return this.roleService.updateRole(id, data);
  }

  @Auth()
  @Permission(['ROLE::GET::INFO'])
  @Get('/:id')
  async getRole(
    @Param('id', BigIntPipe) id: bigint,
    @Query('clientId') clientId?: string,
  ) {
    return this.roleService.getRoleInfo(id, clientId);
  }

  @Auth()
  @Permission(['ROLE::GET::LIST'])
  @Get('/')
  async getRoleList(
    @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
    @Query('preId', new BigIntPipe({ optional: true })) preId?: bigint,
    @Query('clientId') clientId?: string,
  ) {
    return this.roleService.getRoleList(preId, size, clientId);
  }
}
