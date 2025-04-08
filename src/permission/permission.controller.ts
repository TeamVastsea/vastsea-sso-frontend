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
import { PermissionService } from './permission.service';
import { Auth, BigIntPipe, Permission } from '@app/decorator';
import {
  CreatePermission,
  GetPermissionList,
  TPermission,
} from './dto/create-permission';
import { UpdatePermission } from './dto/update-permission';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiQuery({ name: 'clientId', description: '客户端的clientId' })
  @ApiQuery({ name: 'size', description: '页大小' })
  @ApiQuery({
    name: 'preId',
    description: '前一页最后一个权限字段的数据库主键',
  })
  @ApiOkResponse({
    type: GetPermissionList,
  })
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

  @ApiCreatedResponse({
    type: TPermission,
  })
  @ApiException(() => BadRequestException, {
    description:
      '如果在同一个client下重复创建一个权限, 会抛出400错误. message字段会阐述失败原因',
  })
  @Auth()
  @Permission(['PERMISSION::CREATE'])
  @Post('/')
  async createPermission(@Body() body: CreatePermission): Promise<TPermission> {
    return this.permissionService.createPermission(body);
  }

  @ApiOkResponse({
    type: TPermission,
  })
  @ApiParam({
    name: 'id',
    description: '权限数据库主键',
  })
  @ApiQuery({
    name: 'clientId',
    description: '要删除哪个客户端中的权限',
  })
  @ApiException(() => NotFoundException, {
    description:
      '如果要删除的权限不在该 client 中, 则会抛出该错误. message 字段会阐述失败原因.',
  })
  @Auth()
  @Permission(['PERMISSION::REMOVE'])
  @Delete('/:id')
  removePermission(
    @Param('id', BigIntPipe) id: bigint,
    @Query('clientId') clientId: string,
  ) {
    return this.permissionService.removePermission(id, clientId);
  }

  @ApiOkResponse({
    type: TPermission,
  })
  @ApiParam({
    name: 'id',
    description: '权限字段数据库主键',
  })
  @ApiQuery({
    name: 'clientId',
    description: '平台颁发的clientId',
  })
  @ApiException(() => NotFoundException, {
    description: `
      如果要的权限不在该 client 中, 则会抛出该错误. message 字段会阐述失败原因.
      `,
  })
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

  @ApiOkResponse({
    type: TPermission,
  })
  @ApiParam({
    name: 'id',
    description: '权限字段数据库主键',
  })
  @ApiQuery({
    name: 'clientId',
    description: '平台颁发的clientId',
  })
  @ApiException(() => NotFoundException, {
    description: `
      如果要的权限不在该 client 中, 则会抛出该错误. message 字段会阐述失败原因.
      `,
  })
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
