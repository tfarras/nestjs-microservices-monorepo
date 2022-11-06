import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CHECK_AUTH, NatsClientService } from '@app/shared';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(private readonly client: NatsClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { authorization = '' } = req.headers;
    const [_, jwt] = authorization.split(' ');

    try {
      const res = await firstValueFrom<boolean>(
        this.client.nats.send(CHECK_AUTH, { jwt }).pipe(timeout(5000)),
      );

      return res;
    } catch (err) {
      this.logger.error(err);

      return false;
    }
  }
}
