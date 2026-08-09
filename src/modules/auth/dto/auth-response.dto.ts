import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ description: '유저 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: '이름', example: '김운동' })
  name: string;

  @ApiProperty({ description: '개인 코드', example: 'USR-000001' })
  personalCode: string;

  @ApiProperty({ description: '현재 모드', enum: ['expert', 'customer'], example: 'customer' })
  currentMode: string;

  @ApiProperty({ description: '소셜 제공자', enum: ['local', 'kakao', 'apple', 'google'], example: 'local' })
  socialProvider: string;

  @ApiProperty({ description: '모드를 명시적으로 확정했는지 여부(false면 모드선택 필요)', example: true })
  hasSelectedMode: boolean;

  @ApiProperty({ description: '자격증 이미지 업로드 여부', example: false })
  hasSubmittedCertification: boolean;
}

export class AuthTokenResponseDto {
  @ApiProperty({ description: '인증된 유저 정보' })
  user: AuthUserDto;

  @ApiProperty({ description: 'Access Token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh Token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class OAuthTokenResponseDto extends AuthTokenResponseDto {
  @ApiProperty({ description: '신규 가입 여부', example: true })
  isNewUser: boolean;
}

export class TokenRefreshResponseDto {
  @ApiProperty({ description: '새 Access Token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: '새 Refresh Token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class MessageResponseDto {
  @ApiProperty({ description: '결과 메시지', example: '로그아웃되었습니다.' })
  message: string;
}
