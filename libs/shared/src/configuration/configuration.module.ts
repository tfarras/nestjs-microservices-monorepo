import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { authConfig, databaseConfig, natsConfig } from './configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.test'],
      load: [databaseConfig, authConfig, natsConfig],
    }),
  ],
})
export class ConfigurationModule {}
