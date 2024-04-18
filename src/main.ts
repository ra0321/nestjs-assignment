import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
const validationPipeService = require('@pipets/validation-pipes');

async function bootstrap() {
  try {
    validationPipeService();
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

    // Swagger Options
    const options = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Swagger API')
      .setDescription('Swagger API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    // Swagger path: http://localhost:3000/docs
    SwaggerModule.setup(`docs`, app, document);

    await app.listen(3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch(err) {

  }
}
bootstrap();
