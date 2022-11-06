import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  ConfigurationModule,
  DatabaseModule,
  LoggingInterceptor,
  NatsClientModule,
} from '@app/shared';

import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, UserModule, NatsClientModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
