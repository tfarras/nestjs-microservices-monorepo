import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { LogEventDto } from '@app/dto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LOG_LOGGER, NatsClientService } from '..';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly client: NatsClientService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return next.handle();
    }

    const rpc = context.switchToRpc();

    return next.handle().pipe(
      tap((response) => {
        const context = rpc.getContext();
        const incommingData = rpc.getData();

        this.logger.debug(
          `Emitting the event: ${JSON.stringify(
            LOG_LOGGER,
          )}. Response: ${JSON.stringify(response)}`,
        );

        this.client.nats.emit<LogEventDto>(LOG_LOGGER, {
          response,
          incommingData,
          context,
        });
      }),
    );
  }
}
