import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';

import { NATS_CONFIG } from '..';
import { NatsClientService } from './nats-client.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NATS_CLIENT',
        useFactory: (configService: ConfigService) => {
          return configService.get(NATS_CONFIG);
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [NatsClientService],
  exports: [NatsClientService],
})
export class NatsClientModule {}
