import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import {
  Account,
  Auth,
  BigIntPipe,
  Operator,
  Permission,
  PermissionJudge,
} from '@app/decorator';
import { CreateRole } from './dto/create-role.dto';
import { UpdateRole } from './dto/update-role.dto';
import { ApplyDecorator } from '@app/decorator/apply-decorator';
import { RequiredClientAdministrator } from '@app/decorator/required-client-administrator';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApplyDecorator(
    Auth(),
    Permission(['ROLE::CREATE']),
    RequiredClientAdministrator(
      {
        lhs: { op: Operator.HAS, expr: '*' },
        op: Operator.OR,
        rhs: { op: Operator.HAS, expr: 'ROLE::CREATE::*' },
      },
      'body',
      'clientId',
    ),
  )
  @Post('/')
  createRole(@Body() data: CreateRole) {
    return this.roleService.createRole(data);
  }
  @Auth()
  @Permission(['ROLE::REMOVE'])
  @RequiredClientAdministrator({
    lhs: {
      op: Operator.HAS,
      expr: '*',
    },
    op: Operator.OR,
    rhs: { op: Operator.HAS, expr: 'ROLE::REMOVE::*' },
  })
  @Delete('/:id')
  removeRole(@Param('id', BigIntPipe) id: bigint) {
    return this.roleService.removeRole(id);
  }

  @Auth()
  @Permission(['ROLE::UPDATE'])
  @RequiredClientAdministrator(
    {
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'ROLE::UPDATE::*' },
    },
    'body',
  )
  @Patch(':id')
  updateRole(
    @Param('id', BigIntPipe) id: bigint,
    @Body() data: UpdateRole,
    @Account('id') actor: string,
    @PermissionJudge({
      lhs: { op: Operator.HAS, expr: '*' },
      op: Operator.OR,
      rhs: { op: Operator.HAS, expr: 'ROLE::UPDATE::*' },
    })
    force: boolean,
  ) {
    return this.roleService.updateRole(id, data, BigInt(actor), force);
  }

  @Auth()
  @Get('/:id')
  @Permission(['ROLE::QUERY::INFO'])
  @RequiredClientAdministrator({
    lhs: {
      op: Operator.HAS,
      expr: '*',
    },
    op: Operator.OR,
    rhs: { op: Operator.HAS, expr: 'ROLE::QUERY::INFO::*' },
  })
  findRoleInfo(@Param('id', BigIntPipe) id: bigint) {
    return this.roleService.findRole({ id });
  }

  @Auth()
  @Get()
  @Permission(['ROLE::QUERY::LIST'])
  @RequiredClientAdministrator({
    lhs: {
      op: Operator.HAS,
      expr: '*',
    },
    op: Operator.OR,
    rhs: { op: Operator.HAS, expr: 'ROLE::QUERY::LIST::*' },
  })
  findRoleList(
    @Param('clientId') clientId: string,
    @Query('preId', BigIntPipe) preId: bigint,
    @Query('size', ParseIntPipe) size: number,
  ) {
    return this.roleService.findRoleList(size, preId, clientId);
  }
}
