import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const { statusCode } = res;
        const delay = Date.now() - now;
        this.logger.log(`${method} ${url} ${statusCode} - ${delay}ms`);
      }),
      catchError((err) => {
        const delay = Date.now() - now;
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

        if (err instanceof HttpException) {
          statusCode = err.getStatus();
        }

        this.logger.error(
          `${method} ${url} ${statusCode} - ${delay}ms - Error: ${err.message}`,
          err.stack,
        );

        return throwError(() => err);
      }),
    );
  }
}
