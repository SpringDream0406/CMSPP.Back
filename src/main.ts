import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: process.env.FRONT_URL, // 허용할 원본(origin) 설정
    credentials: true, // 쿠키 또는 인증 정보를 포함한 요청을 허용
  });
  await app.listen(3009);
}
bootstrap();
