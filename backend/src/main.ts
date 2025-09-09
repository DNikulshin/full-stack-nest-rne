import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable cookie parser
  app.use(cookieParser());
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') ?? 3000;
  const host = configService.get('HOST') ?? 'localhost';

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('API for user registration, authentication, and management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://${host}:${port}`,
    'Bootstrap',
  );
  Logger.log(
    `📚 Swagger documentation is available at: http://${host}:${port}/api`,
    'Bootstrap',
  );
}
bootstrap();