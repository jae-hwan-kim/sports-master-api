import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ description: '리뷰 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '별점', example: 5 })
  rating: number;

  @ApiPropertyOptional({ description: '코멘트', example: '정말 도움이 되었습니다!' })
  comment: string | null;

  @ApiProperty({ description: '작성일', example: '2024-06-01T10:00:00.000Z' })
  createdAt: Date;
}

export class ExpertReviewListResponseDto {
  @ApiProperty({ description: '리뷰 목록', type: [ReviewResponseDto] })
  reviews: ReviewResponseDto[];

  @ApiProperty({ description: '평균 별점', example: 4.8 })
  avgRating: number;

  @ApiProperty({ description: '총 리뷰 수', example: 42 })
  totalCount: number;
}

export class WeeklyReviewStatsDto {
  @ApiProperty({ description: '이번 주 신규 리뷰 수', example: 3 })
  newReviews: number;

  @ApiProperty({ description: '평균 별점', example: 4.7 })
  avgRating: number;

  @ApiProperty({ description: '등급', enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], example: 'gold' })
  grade: string;
}

export class ReviewTokenResponseDto {
  @ApiProperty({ description: '리뷰 요청 토큰', example: 'abc123reviewtoken' })
  reviewToken: string;

  @ApiProperty({ description: '딥링크 URL', example: 'sportsmaster://review?token=abc123reviewtoken' })
  deepLink: string;
}
