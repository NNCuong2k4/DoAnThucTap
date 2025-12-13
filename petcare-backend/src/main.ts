import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Security headers with Helmet
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Global Validation Pipe
  // FIXED: Changed forbidNonWhitelisted to false to support partial updates
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // ← CHANGED: Allow partial updates
      skipMissingProperties: false, // Validate all provided properties
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Pet Care API')
    .setDescription('API Documentation for Pet Care Management System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and profile management')
    .addTag('Pets', 'Pet management endpoints')
    .addTag('Products', 'Product catalog and management')
    .addTag('Categories', 'Product categories')
    .addTag('Cart', 'Shopping cart management')
    .addTag('Orders', 'Order processing and management')
    .addTag('Appointments', 'Vet appointment booking')
    .addTag('Notifications', 'User notifications')
    .addTag('Blog', 'Blog posts and articles')
    .addTag('Admin', 'Admin dashboard and analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    ╔═══════════════════════════════════════════╗
    ║  🚀 Pet Care API Server Started!         ║
    ╠═══════════════════════════════════════════╣
    ║  🌐 Server:  http://localhost:${port}      ║
    ║  📚 Docs:    http://localhost:${port}/api/docs ║
    ║  🔧 Prefix:  /api                         ║
    ║  🔐 CORS:    Enabled                      ║
    ║  ✅ Swagger: Enabled                      ║
    ╚═══════════════════════════════════════════╝
  `);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
