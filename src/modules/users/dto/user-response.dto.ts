import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: '유저 ID', example: 1 })
  id: number;

  @ApiPropertyOptional({ description: '이메일', example: 'user@example.com' })
  email: string | null;

  @ApiProperty({ description: '이름', example: '김운동' })
  name: string;

  @ApiPropertyOptional({ description: '전화번호', example: '010-1234-5678' })
  phone: string | null;

  @ApiProperty({ description: '개인 코드 (영구 고정)', example: 'USR-000001' })
  personalCode: string;

  @ApiProperty({ description: '현재 모드', enum: ['expert', 'customer'], example: 'customer' })
  currentMode: string;

  @ApiProperty({ description: '소셜 제공자', enum: ['local', 'kakao', 'apple'], example: 'local' })
  socialProvider: string;

  @ApiProperty({ description: '가입일', example: '2024-01-15T09:00:00.000Z' })
  createdAt: Date;
}

export class UpdateModeResponseDto {
  @ApiProperty({ description: '변경된 모드', enum: ['expert', 'customer'], example: 'expert' })
  currentMode: string;

  @ApiProperty({ description: '모드를 명시적으로 확정했는지 여부', example: true })
  hasSelectedMode: boolean;
}
