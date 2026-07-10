import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerProfileResponseDto {
  @ApiProperty({ description: '고객 프로필 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '유저 ID', example: 1 })
  userId: number;

  @ApiProperty({ description: '활동명', example: '스포츠러버' })
  nickname: string;

  @ApiPropertyOptional({ description: '나이', example: 28 })
  age: number | null;

  @ApiPropertyOptional({ description: '성별', enum: ['male', 'female', 'other'], example: 'male' })
  gender: string | null;

  @ApiProperty({ description: '지역', example: '서울 강남구' })
  region: string;

  @ApiPropertyOptional({ description: '주 운동종목', example: '골프' })
  mainSport: string | null;

  @ApiPropertyOptional({ description: '증상/불편 부위', example: ['허리', '무릎'] })
  symptoms: string[] | null;

  @ApiPropertyOptional({ description: '키워드 태그', example: ['재활'] })
  keywordTags: string[] | null;

  @ApiProperty({ description: '생성일', example: '2024-01-15T09:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', example: '2024-06-01T12:00:00.000Z' })
  updatedAt: Date;
}
