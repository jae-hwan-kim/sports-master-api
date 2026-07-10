import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecommendedExpertDto {
  @ApiProperty({ description: '명인 프로필 ID', example: 5 })
  id: number;

  @ApiProperty({ description: '이름', example: '김명인' })
  name: string;

  @ApiProperty({ description: '지역', example: '서울 강남구' })
  region: string;

  @ApiProperty({ description: '대표 서비스', example: '재활 트레이닝' })
  representativeService: string;

  @ApiPropertyOptional({ description: '등급', example: 'gold' })
  expertGrade: string | null;

  @ApiProperty({ description: '평균 별점', example: 4.8 })
  averageRating: number;

  @ApiProperty({ description: '총 리뷰 수', example: 42 })
  totalReviewCount: number;

  @ApiPropertyOptional({ description: '프로필 사진 URL', example: 'https://cdn.example.com/avatar/5.jpg' })
  avatarUrl: string | null;

  @ApiPropertyOptional({ description: '키워드 태그', example: ['재활', '골프'] })
  keywordTags: string[] | null;
}

export class AiRecommendationResponseDto {
  @ApiProperty({
    description: 'AI 요약 메시지',
    example: '허리 통증이 있는 골퍼에게 적합한 재활 전문 명인을 추천해드립니다.',
  })
  aiSummary: string;

  @ApiProperty({ description: '추천 명인 목록 (최대 3명)', type: [RecommendedExpertDto] })
  recommendedExperts: RecommendedExpertDto[];
}
