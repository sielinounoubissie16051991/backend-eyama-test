import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
      'http://localhost:3000',
      'https://front-end-eyama-test.vercel.app' //  URL Vercel de production
    ];

    app.enableCors({
      origin: (origin, callback) => {
        // Permettre les requêtes sans origine (comme Postman ou les requêtes serveurs)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Bloqué par la politique CORS d\'Eyama'));
        }
      },
      credentials: true,
    });
/*
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });
  */

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );


  const config = new DocumentBuilder()
    .setTitle('Eyama API')
    .setDescription('API de test Cloudinary')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`API demarree sur http://localhost:${port}`);
}
bootstrap();