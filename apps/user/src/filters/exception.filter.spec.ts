import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoServerError } from 'mongodb';
import { firstValueFrom } from 'rxjs';

import { ExceptionFilter } from './exception.filter';

describe('ExceptionFilter', () => {
  let exceptionFilter: ExceptionFilter;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [ExceptionFilter],
    }).compile();

    exceptionFilter = app.get<ExceptionFilter>(ExceptionFilter);
  });

  describe('catch', () => {
    it('should throw ConflictException', () => {
      const mongoError = new MongoServerError({
        message: 'Some Message',
        code: 11000,
      });

      expect(firstValueFrom(exceptionFilter.catch(mongoError))).rejects.toEqual(
        new ConflictException(),
      );
    });

    it('should throw inital exception', () => {
      const mongoError = new MongoServerError({
        message: 'Some Message',
        code: 11001,
      });

      expect(firstValueFrom(exceptionFilter.catch(mongoError))).rejects.toEqual(
        mongoError,
      );
    });
  });
});
