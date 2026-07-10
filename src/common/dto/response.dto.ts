import { ApiProperty } from '@nestjs/swagger';

/**
 * ResponseInterceptor가 모든 성공 응답을 { data: T } 로 래핑한다.
 * Swagger 스펙에도 이 래퍼를 반영하기 위한 기준 클래스.
 * 실제 컨트롤러에서는 @ApiDataResponse(Dto) 데코레이터로 사용한다.
 */
export class ResponseDto<T> {
  @ApiProperty({ description: '응답 페이로드' })
  data: T;
}
