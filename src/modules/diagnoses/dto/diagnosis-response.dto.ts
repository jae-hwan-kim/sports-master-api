import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiagnosisCustomerProfileDto {
  @ApiProperty({ description: '개인 코드', example: 'USR-000003' })
  personalCode: string;

  @ApiPropertyOptional({ description: '닉네임', example: '달리기왕', nullable: true })
  nickname: string | null;

  @ApiPropertyOptional({ description: '프로필 이미지 URL', example: 'https://...', nullable: true })
  profileImageUrl: string | null;

  @ApiProperty({ description: '이름', example: '김고객' })
  name: string;

  @ApiPropertyOptional({ description: '나이', example: 28, nullable: true })
  age: number | null;

  @ApiPropertyOptional({ description: '성별', enum: ['male', 'female', 'other'], nullable: true })
  gender: string | null;

  @ApiPropertyOptional({ description: '지역', example: '서울 강남구', nullable: true })
  region: string | null;

  @ApiPropertyOptional({ description: '운동종목', example: '달리기', nullable: true })
  sport: string | null;

  @ApiPropertyOptional({
    description: '키워드 태그 목록',
    example: ['무릎 통증', '자세 교정'],
    nullable: true,
    type: [String],
  })
  keywordTags: string[] | null;

  @ApiPropertyOptional({ description: '마이페이지 소개글', example: '주 3회 달리기를 합니다.', nullable: true })
  introduction: string | null;
}

export class DiagnosisIncomingItemDto {
  @ApiProperty({ description: '진단요청 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '상태', enum: ['pending', 'in_progress', 'completed', 'deleted'], example: 'pending' })
  status: string;

  @ApiProperty({ description: '명인 열람 여부', example: false })
  isViewed: boolean;

  @ApiProperty({ description: '고객 프로필 요약' })
  customerProfile: DiagnosisCustomerProfileDto;

  @ApiProperty({ description: '요청일', example: '2024-06-01T09:00:00.000Z' })
  createdAt: Date;
}

export class DiagnosisRequestResponseDto {
  @ApiProperty({ description: '진단요청 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '명인 ID', example: 5 })
  expertId: number;

  @ApiProperty({ description: '고객 ID', example: 3 })
  customerId: number;

  @ApiProperty({ description: '상태', enum: ['pending', 'in_progress', 'completed', 'deleted'], example: 'pending' })
  status: string;

  @ApiProperty({ description: '요청일', example: '2024-06-01T09:00:00.000Z' })
  createdAt: Date;
}
