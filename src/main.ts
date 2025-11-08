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
      'http://localhost:3000', // for local backend
      'http://localhost:5173', // for local frontend (Vite/React default)
    ],
    credentials: true, // if you use cookies/auth
  });

  // Temporary raw-body logger + sanitizer for incoming PATCH /user requests
  // (Parse raw JSON, remove null/undefined/empty-string fields, then set req.body
  //  so ValidationPipe receives a cleaned payload.)
  app.use((req, res, next) => {
    try {
      if (req.path && req.path.startsWith('/user') && req.method === 'PATCH') {
        let raw = '';
        req.on('data', (chunk) => {
          raw += chunk;
        });
        req.on('end', () => {
          try {
            const parsed = raw ? JSON.parse(raw) : {};
            // sanitize parsed object: remove null/undefined/empty-string entries
            if (parsed && typeof parsed === 'object') {
              const sanitized: any = {};
              for (const [k, v] of Object.entries(parsed)) {
                if (v === undefined || v === null) continue;
                if (typeof v === 'string' && v.trim() === '') continue;
                sanitized[k] = v;
              }
              req.body = sanitized;
            } else {
              req.body = {};
              console.log(`Sanitized body for ${req.method} ${req.path}: {}`);
            }
          } catch (e) {
            console.log(`Raw body for ${req.method} ${req.path}:`, raw || '{}');
          }
          next();
        });
      } else {
        next();
      }
    } catch (err) {
      // don't block the app for logging failures
      next();
    }
  });

  // Enable validation pipes - whitelist will strip unknown properties before validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

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
