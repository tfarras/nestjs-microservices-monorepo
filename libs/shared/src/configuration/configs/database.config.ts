import { registerAs } from '@nestjs/config';

export const DATABASE_CONFIG = 'database_config';

export interface IDatabaseConfig {
  url: string;
}

export const databaseConfig = registerAs<IDatabaseConfig>(
  DATABASE_CONFIG,
  () => ({
    url: process.env.DATABASE_MONGOOSE || 'mongodb://localhost/microservices',
  }),
);
