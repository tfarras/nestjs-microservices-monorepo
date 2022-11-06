import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

const isObject = (obj: unknown): obj is Record<string, any> =>
  obj === Object(obj);

const mapToHttpException = (exception: unknown): HttpException => {
  if (isObject(exception) && exception.response && exception.status) {
    return new HttpException(exception.response, exception.status);
  }

  return new InternalServerErrorException();
};

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const mappedException =
      exception instanceof HttpException
        ? exception
        : mapToHttpException(exception);

    httpAdapter.reply(
      ctx.getResponse(),
      mappedException.getResponse(),
      mappedException.getStatus(),
    );
  }
}
