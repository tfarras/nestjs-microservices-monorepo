import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserDocument } from '@app/shared';
import { Model } from 'mongoose';

import { UserService } from './user.service';

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

describe('UserService', () => {
  let userService: UserService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockedData.dbUser),
            constructor: jest.fn().mockResolvedValue(mockedData.dbUser),
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockedData.dbUser]),
            }),
            findOne: jest.fn().mockImplementation(({ email }) => {
              return {
                exec: jest
                  .fn()
                  .mockResolvedValue(
                    email === mockedData.dbUser.email
                      ? mockedData.dbUser
                      : undefined,
                  ),
              };
            }),
            update: jest.fn(),
            create: jest.fn().mockResolvedValue(mockedData.dbUser),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = app.get<UserService>(UserService);
    model = app.get<Model<UserDocument>>(getModelToken(User.name));
  });

  describe('findAll', () => {
    it('should return list of users', () => {
      expect(userService.findAll()).resolves.toEqual([mockedData.dbUser]);
      expect(model.find).toBeCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create an user', () => {
      expect(
        userService.create({
          username: 'tfarras',
          email: 'tfarras@test.com',
          password:
            '$2b$10$MySZacsmXvZf/Q5EYd/wk.CgWzi6FkrYHTxDfOmMqfVIU19nxB2Wm',
        }),
      ).resolves.toEqual(mockedData.dbUser);
      expect(model.create).toBeCalledWith({
        username: 'tfarras',
        email: 'tfarras@test.com',
        password:
          '$2b$10$MySZacsmXvZf/Q5EYd/wk.CgWzi6FkrYHTxDfOmMqfVIU19nxB2Wm',
      });
    });

    it('should reject in case of error', () => {
      const spyInstance = jest.spyOn(model, 'create');

      spyInstance.mockImplementationOnce(() => {
        return Promise.reject(new Error());
      });

      expect(
        userService.create({
          username: 'tfarras',
          email: 'tfarras@test.com',
          password:
            '$2b$10$MySZacsmXvZf/Q5EYd/wk.CgWzi6FkrYHTxDfOmMqfVIU19nxB2Wm',
        }),
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('getByEmail', () => {
    it('should return an user', () => {
      expect(userService.getByEmail('tfarras@test.com')).resolves.toEqual(
        mockedData.dbUser,
      );
    });

    it('should return undefined', () => {
      expect(userService.getByEmail('wrongemail@test.com')).resolves.toEqual(
        undefined,
      );
    });
  });
});
