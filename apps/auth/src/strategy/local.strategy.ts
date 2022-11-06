import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserDocument } from '@app/shared';
import { Strategy } from 'passport-local';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserDocument> {
    const user = await firstValueFrom(
      this.authService.validateUser(email, password),
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
