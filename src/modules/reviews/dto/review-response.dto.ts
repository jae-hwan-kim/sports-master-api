import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ description: '리뷰 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '별점', example: 5 })
  rating: number;

  @ApiPropertyOptional({ description: '리뷰 내용', example: '정말 도움이 되었습니다!' })
  content: string | null;

  @ApiProperty({ description: '작성일', example: '2024-06-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ description: '작성자 닉네임', example: '홍길동' })
  customerNickname: string | null;

  @ApiPropertyOptional({ description: '작성자 프로필 이미지 URL', example: 'https://cdn.example.com/avatar/1.jpg' })
  customerProfileImageUrl: string | null;

  @ApiProperty({ description: '리뷰 이미지 URL 목록', type: [String], example: [] })
  imageUrls: string[];

  @ApiProperty({ description: '삭제 요청 여부', example: false })
  deleteRequested: boolean;
}

export class PaginatedReviewsDto {
  @ApiProperty({ type: [ReviewResponseDto] })
  data: ReviewResponseDto[];

  @ApiProperty({ description: '총 리뷰 수', example: 42 })
  total: number;
}

export class ReviewSummaryDto {
  @ApiProperty({ description: '평균 별점', example: 4.8 })
  averageRating: number;

  @ApiProperty({
    description: '별점별 리뷰 수',
    example: { 1: 0, 2: 1, 3: 3, 4: 10, 5: 28 },
  })
  ratingDistribution: Record<number, number>;

  @ApiProperty({ description: '총 리뷰 수', example: 42 })
  totalCount: number;

  @ApiProperty({ description: '사진 리뷰 수', example: 5 })
  photoReviewCount: number;
}

export class DeleteRequestResponseDto {
  @ApiProperty({ description: '삭제 요청 ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '리뷰 ID', example: 1 })
  reviewId: number;

  @ApiProperty({ description: '상태', enum: ['pending', 'approved', 'rejected'], example: 'pending' })
  status: string;

  @ApiProperty({ description: '요청일', example: '2024-06-01T10:00:00.000Z' })
  requestedAt: Date;
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
