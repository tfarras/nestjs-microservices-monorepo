import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Log, LogDocument } from './log.schema';
import { LoggerService } from './logger.service';

const results: Record<string, any> = {
  payload: {
    context: {
      args: ['{"cmd":"create","role":"user"}', null],
    },
    response: {
      username: 'tfarras',
      password: '$2b$10$MySZacsmXvZf/Q5EYd/wk.CgWzi6FkrYHTxDfOmMqfVIU19nxB2Wm',
      email: 'tfarras@test.com',
      _id: '63658cf9f2cbaf2fbfc69368',
      createdAt: '2022-11-04T22:06:49.143Z',
      updatedAt: '2022-11-04T22:06:49.143Z',
    },
  },
  writeLog: {
    _id: '63658cf96acd9ff7d98c2302',
    context: {
      args: ['{"cmd":"create","role":"user"}', null],
    },
    response: {
      username: 'tfarras',
      password: '$2b$10$MySZacsmXvZf/Q5EYd/wk.CgWzi6FkrYHTxDfOmMqfVIU19nxB2Wm',
      email: 'tfarras@test.com',
      _id: '63658cf9f2cbaf2fbfc69368',
      createdAt: '2022-11-04T22:06:49.143Z',
      updatedAt: '2022-11-04T22:06:49.143Z',
    },
    createdAt: '2022-11-04T22:06:49.157Z',
    updatedAt: '2022-11-04T22:06:49.157Z',
  },
};

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let model: Model<LogDocument>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: getModelToken(Log.name),
          useValue: {
            new: jest.fn().mockResolvedValue(results.writeLog),
            constructor: jest.fn().mockResolvedValue(results.writeLog),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn().mockResolvedValue(results.writeLog),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    loggerService = app.get<LoggerService>(LoggerService);
    model = app.get<Model<LogDocument>>(getModelToken(Log.name));
  });

  describe('writeLog', () => {
    it('should return the doc', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      expect(loggerService.writeLog(results.payload)).resolves.toEqual(
        results.writeLog,
      );
    });

    it('calls the model create method', () => {
      loggerService.writeLog(results.payload);

      expect(model.create).toBeCalledWith(results.payload);
    });

    it('should throw if create throws', () => {
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.reject('Something happened'));

      expect(loggerService.writeLog(results.payload)).rejects.toEqual(
        'Something happened',
      );
    });
  });
});
