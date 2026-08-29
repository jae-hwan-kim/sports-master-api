import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class KakaoLoginDto {
  @ApiProperty({ description: '카카오 인가코드', example: 'abc123def456' })
  @IsString()
  @IsNotEmpty()
  code: string;

  // 플랫폼(iOS 시뮬레이터=localhost, Android 에뮬레이터=10.0.2.2)마다 실제 도달 가능한 콜백
  // 주소가 달라 프론트가 authorize 요청에 실제로 사용한 값을 그대로 보낸다 — 토큰 교환 시
  // 카카오가 요구하는 "code 발급 때와 동일한 redirect_uri" 조건을 맞추기 위함.
  @ApiProperty({
    description: '카카오 authorize 요청에 사용한 redirect_uri(콜백 중계 엔드포인트 주소)',
    example: 'http://localhost:3000/auth/kakao/callback',
  })
  @IsString()
  @IsNotEmpty()
  redirectUri: string;
}
