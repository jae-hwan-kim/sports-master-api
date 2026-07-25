import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { requireEnv } from '../config/require-env';

/**
 * 정식 관리자 role 모델이 도입되기 전까지의 임시 방편.
 * 요청 헤더 X-Admin-Key가 ADMIN_API_KEY 환경변수와 일치해야 통과한다.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-admin-key'];
    const adminKey = requireEnv(this.config, 'ADMIN_API_KEY');

    if (!providedKey || providedKey !== adminKey) {
      throw new UnauthorizedException('관리자 권한이 필요합니다.');
    }
    return true;
  }
}
