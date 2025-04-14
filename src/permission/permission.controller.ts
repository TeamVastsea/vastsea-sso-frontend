import {
  Body,
  ConflictException,
  Controller,
  DefaultValuePipe,
  Delete,
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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UpdatePermission } from './dto/update-permission';
@ApiTags('权限')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({
    summary: '创建权限',
    description: `该接口用于在指定的客户端下创建权限。`,
  })
  @ApiException(() => ConflictException, {
    description: '如果创建的权限在客户端下存在, 那么会抛出一个Conflict错误',
  })
  @ApiException(() => NotFoundException, {
    description: '如果客户端不存在, 那么会抛出一个NotFound错误',
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
