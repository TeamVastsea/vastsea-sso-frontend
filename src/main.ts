import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { SpelunkerModule } from 'nestjs-spelunker';

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

  await app.listen(3000);
}
bootstrap();
