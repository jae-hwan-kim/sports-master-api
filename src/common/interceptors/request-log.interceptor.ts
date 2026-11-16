import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// 요청마다 한 줄 기록: 메서드, 경로, 응답 코드, 처리 시간, 사용자 ID
// 쿼리스트링(리뷰 링크 token 등)과 헤더·본문은 기록하지 않음 — 민감값 보호
@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<{ method: string; path?: string; url: string; user?: { id: number } }>();
    const res = http.getResponse<{ statusCode: number }>();
    const path = (req.path ?? req.url.split('?')[0]) as string;
    const started = Date.now();
    const userPart = req.user?.id ? ` user=${req.user.id}` : '';

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${req.method} ${path} ${res.statusCode} ${Date.now() - started}ms${userPart}`);
      }),
      catchError((error: { status?: number; statusCode?: number }) => {
        const status = error?.status ?? error?.statusCode ?? 500;
        this.logger.warn(`${req.method} ${path} ${status} ${Date.now() - started}ms${userPart}`);
        return throwError(() => error);
      }),
    );
  }
}
