import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  autoMocker,
  CREATE_USER,
  GET_USER,
  NatsClientService,
} from '@app/shared';
import { of } from 'rxjs';

import { CryptoService } from './crypto/crypto.service';
import { AuthService } from './auth.service';

const mockedData: Record<string, any> = {
  user: {
    username: 'tfarras',
    email: 'tfarras@test.com',
    password: 'somePass',
  },
  dbUser: {
    _id: '63658cf9f2cbaf2fbfc69368',
    username: 'tfarras',
    password: '$2b$10$MySZacsmXvZf/Q5EYd/wk.CgWzi6FkrYHTxDfOmMqfVIU19nxB2Wm',
    email: 'tfarras@test.com',
    createdAt: '2022-11-04T22:06:49.143Z',
    updatedAt: '2022-11-04T22:06:49.143Z',
  },
};

mockedData.jwtPayload = {
  user: mockedData.dbUser,
  sub: mockedData.dbUser._id,
};

describe('AuthService', () => {
  let authService: AuthService;

  const mocks = {
    crypto: {
      compareHash: jest.fn().mockReturnValue(true),
      generateHash: jest.fn().mockResolvedValue('someHashedString'),
    },
    jwt: {
      sign: jest.fn().mockReturnValue('thisIsTheAccessToken'),
      verify: jest.fn().mockReturnValue(mockedData.jwtPayload),
    },
    natsClient: {
      nats: {
        send: jest.fn().mockImplementation(() => of(mockedData.dbUser)),
      },
    },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker(
        autoMocker([
          [CryptoService, mocks.crypto],
          [NatsClientService, mocks.natsClient],
          [JwtService, mocks.jwt],
        ]),
      )
      .compile();

    authService = app.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should generate hash', () => {
      authService.register(mockedData.user);

      expect(mocks.crypto.generateHash).toBeCalledWith(
        mockedData.user.password,
      );
    });

    it('should send message to client proxy', () => {
      authService.register(mockedData.user);

      expect(mocks.natsClient.nats.send).toBeCalledWith(CREATE_USER, {
        ...mockedData.user,
        password: 'someHashedString',
      });
    });

    it('should reject in case of an error', () => {
      mocks.natsClient.nats.send.mockImplementationOnce(() => {
        throw new Error();
      });

      expect(authService.register(mockedData.user)).rejects.toEqual(
        new Error(),
      );
    });

    it('should return observable', async () => {
      const result = await authService.register(mockedData.user);

      result.subscribe((data) => {
        expect(data).toEqual(mockedData.dbUser);
      });
    });
  });

  describe('validateUser', () => {
    it('should send message to client proxy', () => {
      authService.validateUser(mockedData.user.email, mockedData.user.password);

      expect(mocks.natsClient.nats.send).toBeCalledWith(GET_USER, {
        email: 'tfarras@test.com',
      });
    });

    it('should call compareHash and return true', () => {
      authService
        .validateUser(mockedData.user.email, mockedData.user.password)
        .subscribe((data) => {
          expect(mocks.crypto.compareHash).toBeCalledWith(
            mockedData.user.password,
            mockedData.dbUser.password,
          );
          expect(mocks.crypto.compareHash).toReturnWith(true);
          expect(data).toEqual(mockedData.dbUser);
        });
    });

    it('should call compareHash and return null', () => {
      mocks.crypto.compareHash.mockReturnValueOnce(false);

      authService
        .validateUser(mockedData.user.email, mockedData.user.password)
        .subscribe((data) => {
          expect(mocks.crypto.compareHash).toBeCalledWith(
            mockedData.user.password,
            mockedData.dbUser.password,
          );
          expect(mocks.crypto.compareHash).toReturnWith(false);
          expect(data).toEqual(null);
        });
    });
  });

  describe('login', () => {
    it('should all the sign method', () => {
      expect(authService.login(mockedData.dbUser)).toEqual({
        userId: mockedData.dbUser.id,
        accessToken: 'thisIsTheAccessToken',
      });
      expect(mocks.jwt.sign).toBeCalledWith({
        user: mockedData.dbUser,
        sub: mockedData.dbUser.id,
      });
    });
  });

  describe('validateToken', () => {
    it('should all the sign method', () => {
      expect(authService.validateToken('thisIsTheAccessToken')).toEqual(
        mockedData.jwtPayload,
      );
      expect(mocks.jwt.verify).toBeCalledWith('thisIsTheAccessToken');
    });
  });
});
