import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import {
  AUTH_CONFIG,
  ConfigurationModule,
  LoggingInterceptor,
  NatsClientModule,
} from '@app/shared';

import { CryptoModule } from './crypto/crypto.module';
import { AllExceptionFilter } from './filter/all-exception.filter';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigurationModule,
    CryptoModule,
    NatsClientModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get(`${AUTH_CONFIG}.jwtSecret`),
          signOptions: { expiresIn: '60s' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AuthModule {}
