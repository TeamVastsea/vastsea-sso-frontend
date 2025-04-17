import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit{
  constructor(){
    super(process.env.NODE_ENV === 'development' ? {
      log: ['query', 'info', 'warn', 'error'],
    } : undefined)
  }
  async onModuleInit() {
    await this.$connect();
  }
}
