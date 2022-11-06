import { Catch, ConflictException, RpcExceptionFilter } from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import { Observable, throwError } from 'rxjs';

const MONGO_DUPLICATE_ERROR_CODE = 11000;

@Catch(MongoServerError)
export class ExceptionFilter implements RpcExceptionFilter<MongoServerError> {
  catch(exception: MongoServerError): Observable<any> {
    return throwError(() =>
      exception.code === MONGO_DUPLICATE_ERROR_CODE
        ? new ConflictException()
        : exception,
    );
  }
}
