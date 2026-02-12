import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // 👈 SOLO agregas esta línea

  await app.listen(3000);
}
bootstrap();
