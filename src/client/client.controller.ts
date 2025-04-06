import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
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
import { Auth, BigIntPipe, Permission } from '@app/decorator';
import { CreateClient } from './dto/create-client';
import { UpdateClient } from './dto/update-client';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ClientList, TClient } from './dto/client-list.dto';
import { Client } from '@prisma/client';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiOkResponse({
    description: '获取Client列表',
    type: ClientList,
  })
  @ApiQuery({ name: 'preId', description: '前一个client id' })
  @ApiQuery({ name: 'size', description: '获取多少客户端' })
  @Auth()
  @Permission(['CLIENT::GET::LIST'])
  @Get('/')
  async getClientList(
    @Query('preId', new BigIntPipe({ optional: true })) preId: bigint,
    @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
  ): Promise<ClientList> {
    return this.clientService.getClients(preId, size);
  }

  @ApiOkResponse({
    description: '获取某个客户端的详细信息',
    type: TClient,
  })
  @ApiParam({ name: 'id', description: '客户端的数据库主键' })
  @ApiOkResponse({
    description: '返回客户端信息, 包含clientSecret',
  })
  @ApiNotFoundResponse({
    type: HttpException,
    description:
      '当客户端不存在时, 将会抛出404错误, message字段是一个自然语言, 用于阐述错误原因.',
  })
  @Auth()
  @Permission(['CLIENT::GET::INFO'])
  @Get('/:id')
  async getClientInfo(
    @Param('id', new BigIntPipe()) id: bigint,
  ): Promise<Client> {
    return this.clientService.findClientById(id);
  }

  @ApiCreatedResponse({
    type: TClient,
  })
  @Auth()
  @Permission(['CLIENT::CREATE'])
  @Post('/')
  async createClient(@Body() body: CreateClient) {
    return this.clientService.createClient(body);
  }

  @ApiOkResponse({
    type: TClient,
  })
  @ApiParam({
    name: 'id',
    description: '客户端数据库主键, 非client-id.',
  })
  @ApiException(() => NotFoundException, {
    description:
      '当需要删除的客户端不存在, 接口会抛出404异常. message字段用于阐述错误原因',
  })
  @Auth()
  @Permission(['CLIENT::REMOVE'])
  @Delete('/:id')
  async removeClient(@Param('id', BigIntPipe) id: bigint) {
    return this.clientService.removeClient(id);
  }

  @ApiOkResponse({
    description: '返回一个修改结果',
    type: TClient,
  })
  @Auth()
  @Permission(['CLIENT::UPDATE'])
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async updateClient(
    @Param('id', BigIntPipe) id: bigint,
    @Body() body: UpdateClient,
  ) {
    return this.clientService.updateClient(id, body);
  }
}
