import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { autoMocker } from '@app/shared';
import { of } from 'rxjs';

import { AuthService } from '../auth.service';
import { LocalStrategy } from './local.strategy';

const mockedData = {
  dbUser: {
    _id: '63658cf9f2cbaf2fbfc69368',
    username: 'tfarras',
    password: '$2b$10$MySZacsmXvZf/Q5EYd/wk.CgWzi6FkrYHTxDfOmMqfVIU19nxB2Wm',
    email: 'tfarras@test.com',
    createdAt: '2022-11-04T22:06:49.143Z',
    updatedAt: '2022-11-04T22:06:49.143Z',
  },
};

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;

  const mocks = {
    auth: {
      validateUser: jest
        .fn()
        .mockImplementation((email: string, password: string) => {
          if (email === mockedData.dbUser.email && password === 'rightPass') {
            return of(mockedData.dbUser);
          }

          return of(undefined);
        }),
    },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [LocalStrategy],
    })
      .useMocker(autoMocker([[AuthService, mocks.auth]]))
      .compile();

    localStrategy = app.get<LocalStrategy>(LocalStrategy);
  });

  describe('validate', () => {
    it('should return an user', () => {
      const data = ['tfarras@test.com', 'rightPass'] as const;

      expect(localStrategy.validate(...data)).resolves.toEqual(
        mockedData.dbUser,
      );
      expect(mocks.auth.validateUser).toBeCalledWith(...data);
    });

    it('should throw UnauthorizedException in case of wrongPass', () => {
      const data = ['tfarras@test.com', 'wrongPass'] as const;

      expect(localStrategy.validate(...data)).rejects.toEqual(
        new UnauthorizedException(),
      );
      expect(mocks.auth.validateUser).toBeCalledWith(...data);
    });

    it('should throw UnauthorizedException in case of wrong email', () => {
      const data = ['wrongemail@test.com', 'rightPass'] as const;

      expect(localStrategy.validate(...data)).rejects.toEqual(
        new UnauthorizedException(),
      );
      expect(mocks.auth.validateUser).toBeCalledWith(...data);
    });
  });
});
