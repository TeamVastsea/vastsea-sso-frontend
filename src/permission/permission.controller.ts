import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PermissionService } from './permission.service';

import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { CreatePermission } from './dto/create-permission';
import {
  BigIntPipe,
  Account,
  PermissionJudge,
  Operator,
  Permission,
  Auth,
} from '@app/decorator';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiParam,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { UpdatePermission } from './dto/update-permission';
import { PermissionEntry, PermissionList } from './entries/permission.entries';
@ApiTags('权限')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiCreatedResponse({ type: PermissionEntry })
  @ApiOperation({
    summary: '创建权限',
    description: `该接口用于在指定的客户端下创建权限。`,
  })
  @ApiException(() => NotFoundException, {
    description: '如果客户端不存在, 那么会抛出一个NotFound错误',
  })
  @ApiException(() => BadRequestException, {
    description: '如果权限字段存在, 会抛出400错误',
  })
  @ApiException(() => NotFoundException, {
    description: '如果客户端不存在, 会抛出404错误',
  })
  @ApiException(() => ForbiddenException, {
    description:
      '如果你不是该客户端的管理员且没有拥有 PERMISSION::CREATE::* 或 * 权限, 那么或抛出403错误',
  })
  @Post('/')
  @Auth()
  @Permission({
    lhs: {
      op: Operator.HAS,
      expr: 'PERMISSION::CREATE',
    },
    op: Operator.OR,
    rhs: { op: Operator.HAS, expr: 'PERMISSION::CREATE::*' },
  })
  createPermission(
    @Body() data: CreatePermission,
    @Account('id') actor: string,
    @PermissionJudge({
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'PERMISSION::CREATE::*' },
    })
    force: boolean,
  ) {
    return this.permissionService.createPermission(data, BigInt(actor), force);
  }

  @ApiException(() => ConflictException, {
    description: '如果权限存在, 但是有角色绑定了这个权限会抛出Conflict错误',
  })
  @ApiException(() => NotFoundException, {
    description: '如果权限字段不存在, 会抛出404错误',
  })
  @ApiException(() => ForbiddenException, {
    description:
      '如果你不是这个权限所属客户端的管理员, 且没有PERMISSION::REMOVE::* 则会抛出403',
  })
  @Auth()
  @Delete(':id')
  @Permission({
    lhs: { op: Operator.HAS, expr: 'PERMISSION::REMOVE' },
    op: Operator.OR,
    rhs: {
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'PERMISSION::REMOVE::*' },
    },
  })
  @ApiParam({ name: 'id', description: '要删除的权限数据库主键' })
  removePermission(
    @Param('id', BigIntPipe) id: bigint,
    @Account('id') _userId: string,
    @PermissionJudge({
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'PERMISSION::REMOVE::*' },
    })
    allow: boolean,
  ) {
    return this.permissionService.removePermission(id, BigInt(_userId), allow);
  }

  @ApiException(() => NotFoundException, {
    description: '如果权限不存在, 则会抛出404错误',
  })
  @ApiException(() => ForbiddenException, {
    description:
      '权限存在, 但是你不是这个权限所属客户端的管理员, 那么会抛出403错误. 除非调用方拥有 * 或 PERMISSION::UPDATE::* 权限',
  })
  @ApiException(() => ForbiddenException, {
    description:
      '权限存在, 但是调用方企图将权限转移到另一个不属于调用方管理的客户端中, 会抛出403错误. 除非调用方拥有 * 或 PERMISSION::UPDATE::* 权限',
  })
  @Auth()
  @Permission({
    lhs: { op: Operator.HAS, expr: 'PERMISSION::UPDATE' },
    op: Operator.OR,
    rhs: {
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'PERMISSION::UPDATE::*' },
    },
  })
  @ApiParam({ name: 'id', description: '要修改的权限数据库主键' })
  @Patch(':id')
  updatePermission(
    @Param('id', BigIntPipe) id: bigint,
    @Account('id') accountId: string,
    @PermissionJudge({
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'PERMISSION::UPDATE::*' },
    })
    force: boolean,
    @Body() data: UpdatePermission,
  ) {
    return this.permissionService.updatePermission(
      id,
      BigInt(accountId),
      force,
      data,
    );
  }

  @ApiException(() => ForbiddenException, {
    description:
      '如果调用方要获取的权限不在他管理的客户端中, 那么会抛出 403 错误. 除非拥有 PERISSION::QUERY::INFO::* 或 * 权限',
  })
  @ApiException(() => NotFoundException, {
    description: '如果这个权限不位于数据库中则抛出404',
  })
  @ApiParam({ name: 'id', description: '要获取的权限数据库主键' })
  @Auth()
  @Permission({
    lhs: { op: Operator.HAS, expr: 'PERMISSION::QUERY::INFO' },
    op: Operator.OR,
    rhs: {
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'PERMISSION::QUERY::INFO::*' },
    },
  })
  @Get(':id')
  async getPermissionInfo(
    @Param('id', BigIntPipe) id: bigint,
    @Account('id') _accountId: string,
    @PermissionJudge({
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'PERMISSION::QUERY::INFO::*' },
    })
    force: boolean,
  ) {
    const permission = await this.permissionService.findPermission({
      id,
      accountId: BigInt(_accountId),
      force,
    });
    if (!permission) {
      throw new HttpException('客户端不存在', HttpStatus.NOT_FOUND);
    }
    return permission;
  }

  @Auth()
  @Permission({
    lhs: { op: Operator.HAS, expr: 'PERMISSION::QUERY::LIST' },
    op: Operator.OR,
    rhs: {
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'PERMISSION::QUERY::LIST::*' },
    },
  })
  @ApiOkResponse({
    type: PermissionList,
  })
  @ApiOperation({ summary: '获取客户端列表' })
  @ApiQuery({
    name: 'clientId',
    required: true,
    description: `平台颁发的clientId.`,
  })
  @ApiQuery({
    name: 'preId',
    required: false,
    description: `
    从哪一个id开始继续获取. 例如数据库中有10条权限字段
    接口返回 [{id:1},{id:2},{id:3},{id:4},{id:5}],
    preId=2&size=1则会从id为2开始继续向后获取一个权限字段.
    `,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: '页大小',
  })
  @Get('/')
  getPermissionList(
    @Query('clientId') clientId: string,
    @Query('preId', new BigIntPipe({ optional: true })) preId: bigint,
    @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
    @PermissionJudge({
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'PERMISSION::QUERY::LIST::*' },
    })
    isSuper: boolean,
  ) {
    return this.permissionService.findPermissionList(
      size,
      preId,
      clientId,
      isSuper,
    );
  }
}
