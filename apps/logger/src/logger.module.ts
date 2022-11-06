import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationModule, DatabaseModule } from '@app/shared';

import { Log, LogSchema } from './log.schema';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: Log.name,
        schema: LogSchema,
      },
    ]),
  ],
  controllers: [LoggerController],
  providers: [LoggerService],
})
export class LoggerModule {}
