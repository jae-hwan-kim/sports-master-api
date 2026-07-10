import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class DiagnosisCustomerProfileDto {
  @ApiProperty({ description: '지역', example: '서울 강남구' })
  region: string;

  @ApiPropertyOptional({ description: '성별', enum: ['male', 'female', 'other'], example: 'male' })
  gender: string | null;

  @ApiProperty({ description: '이름', example: '김고객' })
  name: string;

  @ApiPropertyOptional({ description: '나이', example: 28 })
  age: number | null;

  @ApiPropertyOptional({ description: '운동종목', example: '골프' })
  sport: string | null;

  @ApiProperty({ description: '개인 코드', example: 'USR-000003' })
  personalCode: string;
}

export class DiagnosisIncomingItemDto {
  @ApiProperty({ description: '진단요청 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '고객 프로필 요약' })
  customerProfile: DiagnosisCustomerProfileDto;

  @ApiProperty({ description: '요청일', example: '2024-06-01T09:00:00.000Z' })
  createdAt: Date;
}
