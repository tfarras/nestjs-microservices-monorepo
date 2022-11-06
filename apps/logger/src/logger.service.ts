import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LogEventDto } from '../../../libs/dto/src';
import { Log, LogDocument } from './log.schema';

@Injectable()
export class LoggerService {
  constructor(
    @InjectModel(Log.name)
    private readonly logModel: Model<LogDocument>,
  ) {}

  writeLog(logEventDto: LogEventDto) {
    return this.logModel.create(logEventDto);
  }
}
