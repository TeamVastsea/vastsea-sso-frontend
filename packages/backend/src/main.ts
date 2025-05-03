import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import * as cookieParser from 'cookie-parser';
import { static as static_ } from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
