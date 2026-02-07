import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend
  const allowedOrigins = [
    process.env.FRONTEND_URL ?? 'http://localhost:3000',
    'https://manuelalvarez.cloud',
    'https://www.manuelalvarez.cloud',
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/graphql`);
}
bootstrap();
