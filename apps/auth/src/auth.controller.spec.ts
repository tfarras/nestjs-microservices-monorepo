import { Test, TestingModule } from '@nestjs/testing';
import { autoMocker } from '@app/shared';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  const results = {
    register: {
      _id: '63658cf9f2cbaf2fbfc69368',
      username: 'tfarras',
      password: '$2b$10$MySZacsmXvZf/Q5EYd/wk.CgWzi6FkrYHTxDfOmMqfVIU19nxB2Wm',
      email: 'tfarras@test.com',
      createdAt: new Date(Date.parse('2022-11-04T22:06:49.143Z')),
      updatedAt: new Date(Date.parse('2022-11-04T22:06:49.143Z')),
    },
    login: {
      accessToken: 'someString',
    },
  };

  const mocks = {
    register: jest.fn().mockResolvedValue(results.register),
    login: jest.fn().mockResolvedValue(results.login),
    validateToken: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker(autoMocker([[AuthService, mocks]]))
      .compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should return an user', async () => {
      expect(
        await authController.register({
          username: 'tfarras',
          password: 'somePassword',
          email: 'tfarras@test.com',
        }),
      ).toBe(results.register);
    });

    it('should reject', async () => {
      mocks.register.mockRejectedValueOnce('some reason');

      expect(
        authController.register({
          username: 'tfarras',
          password: 'somePassword',
          email: 'tfarras@test.com',
        }),
      ).rejects.toEqual('some reason');
    });
  });

  describe('login', () => {
    it('should return accessToken', async () => {
      const args = {
        user: results.register,
      } as unknown as Parameters<typeof authController['login']>[0];

      expect(await authController.login(args)).toBe(results.login);
      expect(mocks.login).toBeCalledWith(args.user);
    });

    it('should reject', async () => {
      const args = {
        user: results.register,
      } as unknown as Parameters<typeof authController['login']>[0];
      mocks.login.mockRejectedValueOnce('some reason');

      expect(authController.login(args)).rejects.toEqual('some reason');
    });
  });

  describe('checkAuth', () => {
    it('should return true', () => {
      expect(authController.checkAuth({ jwt: 'someString' })).toEqual(true);
    });

    it('should return false in case of reject', () => {
      mocks.validateToken.mockImplementationOnce(() => {
        throw new Error();
      });

      expect(authController.checkAuth({ jwt: 'someString' })).toEqual(false);
    });
  });
});
