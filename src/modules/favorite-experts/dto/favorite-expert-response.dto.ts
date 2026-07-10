import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FavoriteExpertItemDto {
  @ApiProperty({ description: '명인 프로필 ID', example: 5 })
  id: number;

  @ApiProperty({ description: '이름', example: '김명인' })
  name: string;

  @ApiPropertyOptional({ description: '등급', example: 'gold' })
  grade: string | null;

  @ApiProperty({ description: '리뷰 수', example: 42 })
  reviewCount: number;

  @ApiProperty({ description: '평균 별점', example: 4.8 })
  avgRating: number;

  @ApiPropertyOptional({ description: '프로필 사진 URL', example: 'https://cdn.example.com/avatar/5.jpg' })
  avatarUrl: string | null;
}

export class FavoriteExpertResponseDto {
  @ApiProperty({ description: '관심명인 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '고객 ID', example: 3 })
  customerId: number;

  @ApiProperty({ description: '명인 프로필 ID', example: 5 })
  expertProfileId: number;

  @ApiProperty({ description: '등록일', example: '2024-06-01T09:00:00.000Z' })
  createdAt: Date;
}
