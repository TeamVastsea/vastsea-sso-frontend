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
import { ClientService } from './client.service';
import { CreateClient } from './dto/create-client';
import {
  Account,
  Auth,
  BigIntPipe,
  Operator,
  Permission,
} from '@app/decorator';
import { UpdateClient } from './dto/update-client';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Client, ClientInfo, ClientList } from './entries/clientInfo';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { permissionJudge } from '@app/decorator/permission-judge';
import { PublicClientInfo } from './entries/public-client-info';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiException(() => ConflictException, {
    description: '如果第三方客户端重名, 则会抛出一个Conflict的异常',
  })
  @ApiOperation({
    description: '创建一个客户端, 如果重名则获抛出一个ConflictException.',
    summary: '创建客户端接口.',
  })
  @ApiCreatedResponse({ type: Client, description: '创建好的第三方客户端.' })
  @Auth()
  @Post('/')
  @Permission(['CLIENT::CREATE'])
  createClient(
    @Body() createDto: CreateClient,
    @Account('id') accountId: string,
  ) {
    return this.clientService.createClient({
      ...createDto,
      administrator:
        createDto.administrator && createDto.administrator.length
          ? createDto.administrator
          : [BigInt(accountId)],
    });
  }

  @ApiOperation({
    description: `
    停用一个客户端, 如果该客户端不存在会抛出NotFound错误.
    如果该接口不是用户所管理, 则会抛出一个Forbidden错误.
    如果用户拥有 * 或 CLIENT::REMOVE::* 权限, 那么无论这个客户端是否属于用户, 都会被停用
    `,
    summary: '停用客户端接口.',
  })
  @ApiOkResponse({ type: Client, description: '停用后的客户端状态' })
  @ApiException(() => ForbiddenException, {
    description:
      '如果用户尝试停用一个不属于他的客户端, 将会抛出403错误. 如果用户拥有 * 或 CILENT::REMOVE::* 权限, 那么无论这个客户端是否属于用户, 都会被停用',
  })
  @Auth()
  @Delete('/:id')
  @Permission(['CLIENT::REMOVE'])
  removeClient(
    @Param('id', BigIntPipe) id: bigint,
    @Account('id') accountId: string,
    @Account('permissions') permissions: string[],
  ) {
    return this.clientService.removeClient(
      id,
      BigInt(accountId),
      permissionJudge(permissions, {
        lhs: { op: Operator.HAS, expr: '*' },
        op: Operator.OR,
        rhs: { op: Operator.HAS, expr: 'CLIENT::REMOVE::*' },
      }),
    );
  }

  @ApiOperation({
    description: `
    修改客户端, 如果该客户端不存在会抛出NotFound错误.
    如果该接口不是用户所管理, 则会抛出一个Forbidden错误.
    如果用户拥有 * 或 CLIENT::UPDATE::* 权限, 那么无论这个客户端是否属于用户, 都会被修改
    `,
    summary: '修改客户端接口.',
  })
  @ApiOkResponse({ type: Client, description: '修改完成的第三方客户端' })
  @ApiException(() => ForbiddenException, {
    description:
      '如果用户尝试修改一个不属于他的客户端, 将会抛出403错误. 如果用户存在 * 或 CLIENT::UPDATE::* 权限, 那么无论这个客户端是否归属该用户管理, 都会被修改',
  })
  @Auth()
  @Patch('/:id')
  @Permission(['CLIENT::UPDATE'])
  updateClient(
    @Param('id', BigIntPipe) id: bigint,
    @Body() updateDto: UpdateClient,
    @Account('id') accountId: string,
    @Account('permissions') permissions: string[],
  ) {
    return this.clientService.updateClient(
      id,
      updateDto,
      BigInt(accountId),
      permissionJudge(permissions, {
        lhs: { op: Operator.HAS, expr: '*' },
        op: Operator.OR,
        rhs: { op: Operator.HAS, expr: 'CLIENT::UPDATE::*' },
      }),
    );
  }

  @ApiOperation({
    description: `
    获取客户端详细信息, 如果该客户端不存在会抛出NotFound错误.
    如果该接口不是用户所管理, 则会抛出一个Forbidden错误.
    如果用户拥有 * 或 CLIENT::INFO::* 权限, 那么无论这个客户端是否属于用户, 都会被修改.
    `,
    summary: '获取客户端详细信息接口.',
  })
  @ApiOkResponse({ type: ClientInfo, description: '客户端详细信息.' })
  @ApiException(() => NotFoundException, {
    description: '如果这个客户端不在数据库内, 会抛出404错误',
  })
  @ApiException(() => NotFoundException, {
    description:
      '如果用户企图获取不属于他管理的客户端的详细信息,那么会抛出一个404错误. 如果用户存在 * 或 CLIENT::QUERY::INFO::* 权限. 那么不会抛出404错误',
  })
  @Auth()
  @Get(':id')
  @Permission(['CLIENT::QUERY::INFO'])
  async getClientInfo(
    @Param('id', BigIntPipe) id: bigint,
    @Account('id') accountId: string,
    @Account('permissions') permissions: string[],
  ) {
    const client = await this.clientService.findClient({ id });
    if (!client) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    const _accountId = BigInt(accountId);
    if (
      client.administrator.every((manager) => manager.id !== _accountId) &&
      !permissionJudge(permissions, {
        lhs: { op: Operator.HAS, expr: '*' },
        op: Operator.OR,
        rhs: { op: Operator.HAS, expr: 'CLIENT::QUERY::INFO::*' },
      })
    ) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    return client;
  }

  @ApiOkResponse({ type: PublicClientInfo })
  @ApiParam({ description: '客户端的clinetId', name: 'clientId' })
  @ApiException(() => NotFoundException, {
    description: '如果客户端不存在, 则会抛出404错误',
  })
  @ApiException(() => BadRequestException, {
    description: '如果客户端存在, 但是被停用则会抛出400错误',
  })
  @Get('/pub-info/:clientId')
  async getClientPubInfo(@Param('clientId') clientId: string) {
    const clientInfo = await this.clientService.findClient({ clientId });
    if (!clientInfo) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    if (!clientInfo.active) {
      throw new HttpException('资源被停用', HttpStatus.BAD_REQUEST);
    }
    return {
      clientId,
      avatar: clientInfo.avatar,
      name: clientInfo.name,
      redirect: clientInfo.redirect,
    };
  }

  @ApiQuery({
    name: 'preId',
    description:
      '客户端列表前一页的最后一个Id, 这么做主要是为了规避深分页导致的性能力劣化. 如果不穿, 则默认从第一条数据开始',
  })
  @ApiQuery({ name: 'size', description: '页大小' })
  @ApiOperation({
    description:
      '如果操作角色拥有 CLIENT::QUERY::LIST::* 或 * 权限, 那么可以获取所有客户端列表',
    summary: '获取客户端列表',
  })
  @ApiResponse({
    type: ClientList,
    status: HttpStatus.OK,
    description: '获取所有属于自己管理的客户端列表. 不在乎是否停用',
  })
  @Auth()
  @Get('/')
  @Permission(['CLIENT::QUERY::LIST'])
  getClientList(
    @Query('preId', new BigIntPipe({ optional: true })) preId: bigint,
    @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
    @Account('id') accountId: string,
    @Account('permissions') permissions: string[],
  ) {
    return this.clientService.findClientList(
      size,
      preId,
      BigInt(accountId),
      permissionJudge(permissions, {
        lhs: { op: Operator.HAS, expr: '*' },
        op: Operator.OR,
        rhs: { op: Operator.HAS, expr: 'CLIENT::QUERY::LIST::*' },
      }),
    );
  }
}
