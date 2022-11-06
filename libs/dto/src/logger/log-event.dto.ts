import { NatsContext } from '@nestjs/microservices';

export class LogEventDto {
  context: NatsContext;

  response: unknown;

  incomingData: unknown;
}
