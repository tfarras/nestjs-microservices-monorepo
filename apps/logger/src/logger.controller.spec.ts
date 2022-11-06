import { Test, TestingModule } from '@nestjs/testing';
import { autoMocker } from '@app/shared';

import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';

const results: Record<string, any> = {
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

describe('LoggerController', () => {
  let loggerController: LoggerController;
  const loggerServiceMocked = {
    writeLog: jest.fn().mockResolvedValue(results.writeLog),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LoggerController],
    })
      .useMocker(autoMocker([[LoggerService, loggerServiceMocked]]))
      .compile();

    loggerController = app.get<LoggerController>(LoggerController);
  });

  describe('writeLog', () => {
    it('should return call the service', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, createdAt, updatedAt, ...withoutId } = results.writeLog;

      loggerController.logEvent(withoutId);

      expect(loggerServiceMocked.writeLog).toBeCalledTimes(1);
      expect(loggerServiceMocked.writeLog).toBeCalledWith(withoutId);
    });
  });
});
