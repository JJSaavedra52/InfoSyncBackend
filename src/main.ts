import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for your deployed frontend
  app.enableCors({
    origin: [
      'https://infosync-front-1.onrender.com', // <-- deployed frontend domain
    ],
    credentials: true, // if you use cookies/auth
  });

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('InfoSync Backend API')
    .setDescription(
      'API documentation for InfoSync Backend - Pensum Management System',
    )
    .setVersion('1.0')
    .addTag('pensum', 'Pensum management endpoints')
    .addTag('courses', 'Course management within pensums')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('Swagger documentation: http://localhost:3000/api/docs');
}
bootstrap();
