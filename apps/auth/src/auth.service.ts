import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@app/dto';
import {
  CREATE_USER,
  GET_USER,
  NatsClientService,
  UserDocument,
} from '@app/shared';
import {
  catchError,
  map,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';

import { CryptoService } from './crypto/crypto.service';
import { IJwtPayload } from './strategy/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly client: NatsClientService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const password = await this.cryptoService.generateHash(dto.password);

    const newUser: CreateUserDto = {
      ...dto,
      password,
    };

    return this.client.nats.send<UserDocument, CreateUserDto>(
      CREATE_USER,
      newUser,
    );
  }

  validateUser(
    email: string,
    password: string,
  ): Observable<UserDocument | null> {
    return this.client.nats.send<UserDocument>(GET_USER, { email }).pipe(
      timeout(5000),
      map((user) => {
        if (this.cryptoService.compareHash(password, user?.password || '')) {
          return user;
        }

        return null;
      }),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }

        return throwError(() => err);
      }),
    );
  }

  login(user: Omit<UserDocument, 'password'>) {
    const payload: IJwtPayload = { user, sub: user.id };

    return {
      userId: user.id,
      accessToken: this.jwtService.sign(payload),
    };
  }

  validateToken(jwt: string) {
    return this.jwtService.verify<IJwtPayload>(jwt);
  }
}
