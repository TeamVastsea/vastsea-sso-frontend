import {
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
import { Account, Auth, BigIntPipe, Permission } from '@app/decorator';
import { UpdateClient } from './dto/update-client';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Client, ClientInfo, ClientList } from './entries/clientInfo';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { NotFoundError } from 'rxjs';
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiException(() => ConflictException, {
    description: '如果第三方客户端重名, 则会抛出一个Conflict的异常',
  })
  @ApiOperation({
    description: '创建一个第三方客户端.',
    summary: '创建一个第三方客户端',
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
      manager: createDto.manager ? createDto.manager : [BigInt(accountId)],
    });
  }

  @ApiOkResponse({ type: Client, description: '停用后的客户端状态' })
  @ApiException(() => ForbiddenException, {
    description: '如果用户尝试停用一个不属于他的客户端, 将会抛出403错误',
  })
  @Auth()
  @Delete('/:id')
  @Permission(['CLIENT::REMOVE'])
  removeClient(
    @Param('id', BigIntPipe) id: bigint,
    @Account('id') accountId: string,
  ) {
    return this.clientService.removeClient(id, BigInt(accountId));
  }

  @ApiOkResponse({ type: Client, description: '修改完成的第三方客户端' })
  @ApiException(() => ForbiddenException, {
    description: '如果用户尝试修改一个不属于他的客户端, 将会抛出403错误',
  })
  @Auth()
  @Patch('/:id')
  @Permission(['CLIENT::UPDATE'])
  updateClient(
    @Param('id', BigIntPipe) id: bigint,
    @Body() updateDto: UpdateClient,
    @Account('id') accountId: string,
  ) {
    return this.clientService.updateClient(id, updateDto, BigInt(accountId));
  }

  @ApiOkResponse({ type: ClientInfo, description: '客户端详细信息.' })
  @ApiException(() => NotFoundException, {
    description:
      '如果用户企图获取不属于他管理的客户端的详细信息,那么会抛出一个404错误',
  })
  @Auth()
  @Get(':id')
  @Permission(['CLIENT::QUERY::INFO'])
  async getClientInfo(
    @Param('id', BigIntPipe) id: bigint,
    @Account('id') accountId: string,
  ) {
    const client = await this.clientService.findClient({ id });
    if (!client) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    const _accountId = BigInt(accountId);
    if (client.manager.every((manager) => manager.id !== _accountId)) {
      throw new HttpException('资源不存在', HttpStatus.NOT_FOUND);
    }
    return client;
  }

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
  ) {
    return this.clientService.findClientList(size, preId, BigInt(accountId));
  }
}
