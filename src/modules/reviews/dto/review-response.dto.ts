import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewCreatedDto {
  @ApiProperty({ description: '생성된 리뷰 ID', example: 1 })
  id: number;
}

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

  @ApiProperty({ description: '리뷰 대상 명인 프로필 ID', example: 3 })
  expertProfileId: number;

  @ApiPropertyOptional({ description: '리뷰 대상 명인 이름 (내가 쓴 리뷰 목록에서만 채움)', example: '김명인' })
  expertName?: string;
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

  @ApiProperty({
    description: '공유용 https 링크 — 메신저에서 클릭 가능, 열면 앱(딥링크)으로 이동',
    example: 'https://api.example.com/r/review?token=abc123reviewtoken',
  })
  shareUrl: string;
}

export class ReviewLinkInfoDto {
  @ApiProperty({ description: '명인 프로필 ID', example: 5 })
  expertProfileId: number;

  @ApiProperty({ description: '명인 표시 이름', example: '아쿠아퍼포먼스' })
  expertName: string;

  @ApiPropertyOptional({ description: '명인 대표 사진 URL', example: 'https://cdn.example.com/images/1.jpg' })
  expertAvatarUrl: string | null;

  @ApiPropertyOptional({ description: '명인 등급', enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] })
  expertGrade: string | null;

  @ApiProperty({ description: '본인(명인)의 링크인지 — 본인에게는 리뷰 작성 불가', example: false })
  isMine: boolean;

  @ApiProperty({ description: '이미 이 명인에게 리뷰를 작성했는지', example: false })
  alreadyReviewed: boolean;
}
