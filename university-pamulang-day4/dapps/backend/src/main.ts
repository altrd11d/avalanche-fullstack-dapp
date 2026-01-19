import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Simple Storage dApp API')
    .setDescription(`
Avalanche Full Stack dApp – Day 4

Nama Lengkap : Alfitri Deviani

NIM          : 221011450319

Backend API for Simple Storage Smart Contract
Using NestJS + Avalanche Fuji Testnet
    `)
    .setVersion('1.0')
    .addTag('simple-storage')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});
