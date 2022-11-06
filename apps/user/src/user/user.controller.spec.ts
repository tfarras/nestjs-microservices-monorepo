import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { autoMocker } from '@app/shared';

import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let userController: UserController;

  const results = {
    dbUser: {
      _id: '63658cf9f2cbaf2fbfc69368',
      username: 'tfarras',
      password: '$2b$10$MySZacsmXvZf/Q5EYd/wk.CgWzi6FkrYHTxDfOmMqfVIU19nxB2Wm',
      email: 'tfarras@test.com',
      createdAt: new Date(Date.parse('2022-11-04T22:06:49.143Z')),
      updatedAt: new Date(Date.parse('2022-11-04T22:06:49.143Z')),
    },
  };

  const mocks = {
    findAll: jest.fn().mockResolvedValue([results.dbUser]),
    create: jest.fn().mockResolvedValue(results.dbUser),
    getByEmail: jest.fn().mockImplementation((email) => {
      return Promise.resolve(
        email === results.dbUser.email ? results.dbUser : undefined,
      );
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    })
      .useMocker(autoMocker([[UserService, mocks]]))
      .compile();

    userController = app.get<UserController>(UserController);
  });

  describe('users', () => {
    it('should return the list of users', () => {
      expect(userController.users()).resolves.toEqual([results.dbUser]);
    });
  });

  describe('createUser', () => {
    it('should return an user', () => {
      expect(
        userController.createUser({
          username: 'tfarras',
          email: 'tfarras@test.com',
          password: 'somePassword',
        }),
      ).resolves.toEqual(results.dbUser);
    });

    it('should reject in case of some error in service', () => {
      mocks.create.mockRejectedValueOnce(new ConflictException());

      expect(
        userController.createUser({
          username: 'tfarras',
          email: 'tfarras@test.com',
          password: 'somePassword',
        }),
      ).rejects.toEqual(new ConflictException());
    });
  });

  describe('getUser', () => {
    it('should return an user', () => {
      expect(userController.getUser(results.dbUser)).resolves.toEqual(
        results.dbUser,
      );
    });

    it('should return an user', () => {
      expect(userController.getUser({ email: 'none' })).resolves.toEqual(
        undefined,
      );
    });
  });
});
