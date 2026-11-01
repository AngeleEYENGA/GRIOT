import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: allowedOrigins, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentation interactive — utile pour la démo et les premiers tests
  // manuels, en attendant une vraie interface front connectée à l'API.
  const config = new DocumentBuilder()
    .setTitle('GRIOT API')
    .setDescription("API de GRIOT — Lot 1 (socle) : auth, arbres, membres/rôles, personnes, relations")
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`GRIOT API démarrée sur http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Documentation interactive : http://localhost:${port}/docs`);
}

bootstrap();
