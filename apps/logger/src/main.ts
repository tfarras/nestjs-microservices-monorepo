import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NATS_CONFIG } from '@app/shared';

import { LoggerModule } from './logger.module';

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(LoggerModule);

  const configService = context.get(ConfigService);

  const logger = await NestFactory.createMicroservice<MicroserviceOptions>(
    LoggerModule,
    configService.get(NATS_CONFIG),
  );

  await logger.listen();
}

bootstrap();
