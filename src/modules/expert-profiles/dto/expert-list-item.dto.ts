import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpertListItemDto {
  @ApiProperty({ description: '명인 프로필 ID', example: 5 })
  id: number;

  @ApiProperty({ description: '센터명', example: '아쿠아퍼포먼스' })
  name: string;

  @ApiProperty({ description: '지역', example: '경기 고양시 일산서구' })
  region: string;

  @ApiProperty({ description: '대표 서비스', example: '재활 트레이닝' })
  representativeService: string;

  @ApiPropertyOptional({ description: '키워드 태그', example: ['방문재활', '선수트레이닝'] })
  keywordTags: string[] | null;

  @ApiPropertyOptional({ description: '대표 이미지 URL', example: 'https://cdn.example.com/expert/5.jpg' })
  imageUrl: string | null;

  @ApiProperty({ description: '평균 평점', example: 4.8 })
  averageRating: number;

  @ApiProperty({ description: '리뷰 수', example: 12 })
  totalReviewCount: number;
}
