import { ConfigService } from '@nestjs/config';

/** 필수 환경변수를 조회한다. 값이 없으면 즉시 에러를 던져 하드코딩된 기본값으로 조용히 대체되는 것을 막는다. */
export function requireEnv(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (!value) {
    throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
}
