import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import * as cookieParser from 'cookie-parser';
import { static as static_ } from 'express';
import { join } from 'path';
import 'winston-daily-rotate-file';
import * as winston from 'winston';
import { utilities, WinstonModule } from 'nest-winston';
import { windowTime } from 'rxjs';
import { FileTypeValidator } from '@nestjs/common';

const CONSOLE_TRANSPORT = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    utilities.format.nestLike(),
  ),
});

const FILE_TRANSPORT = new winston.transports.DailyRotateFile({
  dirname: join(__dirname, 'logs'),
  filename: 'application-%DATE%.info.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.json(),
  ),
  level: 'info',
});

const ERR_FILE_TRANSPORT = new winston.transports.DailyRotateFile({
  dirname: join(__dirname, 'logs'),
  filename: 'application-%DATE%.err.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.json(),
  ),
  level: 'error',
});

async function bootstrap() {
  const instance = winston.createLogger({
    transports: [CONSOLE_TRANSPORT, FILE_TRANSPORT, ERR_FILE_TRANSPORT],
  });

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({ instance }),
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE)
    .setDescription(process.env.SWAGGER_DESC)
    .setVersion(process.env.VERSION)
    .build();
  const factory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/swagger', app, factory);
  patchNestJsSwagger();
  app.use(cookieParser());
  app.use(static_(join(__dirname, 'assets')));
  await app.listen(3000);
}
bootstrap();
