import { registerAs } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export const NATS_CONFIG = 'nats';

export const natsConfig = registerAs<MicroserviceOptions>(
  NATS_CONFIG,
  (): MicroserviceOptions => ({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
    },
  }),
);
