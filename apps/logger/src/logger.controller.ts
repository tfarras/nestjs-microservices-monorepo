import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { LogEventDto } from '@app/dto';
import { LOG_LOGGER } from '@app/shared';

import { LoggerService } from './logger.service';

@Controller()
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @EventPattern(LOG_LOGGER)
  logEvent(@Payload() logEventDto: LogEventDto): void {
    this.loggerService.writeLog(logEventDto);
  }
}
