import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
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
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { RoleList, TRole } from './dto/role.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiCreatedResponse({
    type: TRole,
  })
  @ApiException(() => BadRequestException, {
    description: '当角色存在时会返回400错误, message 会阐述失败原因',
  })
  @Auth()
  @Permission(['ROLE::CREATE'])
  @Post('/')
  async createRole(@Body() data: CreateRole) {
    return this.roleService.createRole(data);
  }

  @ApiOkResponse({
    type: TRole,
  })
  @ApiException(() => NotFoundException, {
    description: '当需要删除的角色不存在时, 会抛出404错误. message阐述失败原因',
  })
  @ApiException(() => BadRequestException, {
    description: '当前角色下存在未被删除的子角色时会抛出该错误',
  })
  @Auth()
  @Permission(['ROLE::REMOVE'])
  @Delete('/:id')
  async removeRole(@Param('id', BigIntPipe) id: bigint) {
    return this.roleService.removeRole(id);
  }
  @ApiOkResponse({
    type: TRole,
  })
  @ApiException(() => NotFoundException, {
    description: `
    出现该错误有两种情况两种情况
    1. 当需要修改的角色不存在时, 会抛出404错误. message阐述具体的失败原因
    2. 修改了角色父级, 但角色父级不存在 会抛出404错误. message阐述具体的失败原因
    `,
  })
  @ApiException(() => BadRequestException, {
    description: '当传入了 active 参数时, 该client的父级被删除时会抛出该错误',
  })
  @Auth()
  @Permission(['ROLE::UPDATE'])
  @Patch('/:id')
  async updateRole(
    @Param('id', BigIntPipe) id: bigint,
    @Body() data: UpdateRole,
  ) {
    return this.roleService.updateRole(id, data);
  }

  @ApiOkResponse({
    type: TRole,
    description: '',
  })
  @ApiException(() => NotFoundException, {
    description: '当需要获取的角色不存在时, 会抛出404错误. message阐述失败原因',
  })
  @Auth()
  @Permission(['ROLE::GET::INFO'])
  @Get('/:id')
  async getRole(
    @Param('id', BigIntPipe) id: bigint,
    @Query('clientId') clientId?: string,
  ) {
    return this.roleService.getRoleInfo(id, clientId);
  }

  // TODO: swagger doc

  @ApiOkResponse({
    type: RoleList,
  })
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
