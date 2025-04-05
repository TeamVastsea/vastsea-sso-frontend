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
import { ClientService } from './client.service';
import { Auth, BigIntPipe, Permission } from '@app/decorator';
import { CreateClient } from './dto/create-client';
import { UpdateClient } from './dto/update-client';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Auth()
  @Permission(['CLIENT::GET::LIST'])
  @Get('/')
  async getClientList(
    @Query('preId', new BigIntPipe({ optional: true })) preId: bigint,
    @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
  ) {
    return this.clientService.getClients(preId, size);
  }

  @Auth()
  @Permission(['CLIENT::GET::INFO'])
  @Get('/:id')
  async getClientInfo(@Param('id', new BigIntPipe()) id: bigint) {
    return this.clientService.findClientById(id);
  }

  @Auth()
  @Permission(['CLIENT::CREATE'])
  @Post('/')
  async createClient(@Body() body: CreateClient) {
    return this.clientService.createClient(body);
  }

  @Auth()
  @Permission(['CLIENT::REMOVE'])
  @Delete('/:id')
  async removeClient(@Param('id', BigIntPipe) id: bigint) {
    return this.clientService.removeClient(id);
  }

  @Auth()
  @Permission(['CLIENT::UPDATE'])
  @Patch('/:id')
  async updateClient(
    @Param('id', BigIntPipe) id: bigint,
    @Body() body: UpdateClient,
  ) {
    return this.clientService.updateClient(id, body);
  }
}
