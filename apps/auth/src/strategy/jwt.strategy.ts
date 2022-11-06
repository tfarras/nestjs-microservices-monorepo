import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AUTH_CONFIG, UserDocument } from '@app/shared';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface IJwtPayload {
  user: Omit<UserDocument, 'password'>;
  sub: string;
}

export interface ILoggedUser extends Omit<IJwtPayload, 'sub'> {
  id: string;
}

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(`${AUTH_CONFIG}.jwtSecret`),
    });
  }

  async validate(payload: IJwtPayload): Promise<ILoggedUser> {
    return { id: payload.sub, user: payload.user };
  }
}
