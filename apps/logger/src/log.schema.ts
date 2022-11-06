import { NatsContext } from '@nestjs/microservices';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { LogEventDto } from '../../../libs/dto/src';

export type LogDocument = HydratedDocument<Log>;

@Schema({ timestamps: true, versionKey: false })
export class Log implements LogEventDto {
  @Prop({ type: NatsContext })
  context: NatsContext;

  @Prop({ type: SchemaTypes.Mixed })
  incomingData: unknown;

  @Prop({ type: SchemaTypes.Mixed })
  response: unknown;

  createdAt: Date;

  updatedAt: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);
