import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpertProfileResponseDto {
  @ApiProperty({ description: '명인 프로필 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '유저 ID', example: 1 })
  userId: number;

  @ApiProperty({ description: '활동 지역', example: '서울 강남구' })
  region: string;

  @ApiProperty({ description: '센터명', example: '강남 스포츠 클리닉' })
  centerName: string;

  @ApiProperty({ description: '대표 서비스', example: '재활 트레이닝' })
  representativeService: string;

  @ApiPropertyOptional({ description: '소개 텍스트', example: '10년 경력의 재활 전문 트레이너입니다.' })
  introduction: string | null;

  @ApiPropertyOptional({ description: '카카오 오픈채팅 URL', example: 'https://open.kakao.com/o/example' })
  kakaoOpenChatUrl: string | null;

  @ApiPropertyOptional({
    description: '등급',
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    example: 'gold',
  })
  expertGrade: string | null;

  @ApiProperty({ description: '총 리뷰 수', example: 42 })
  totalReviewCount: number;

  @ApiProperty({ description: '평균 별점', example: 4.8 })
  averageRating: number;

  @ApiProperty({ description: '자격증 검수 상태', enum: ['pending', 'approved', 'rejected'], example: 'approved' })
  certificationStatus: string;

  @ApiPropertyOptional({
    description: '소개 이미지 URL 목록 (최대 5장)',
    example: ['https://cdn.example.com/img/1.jpg'],
  })
  portfolioImageUrls: string[] | null;

  @ApiPropertyOptional({ description: '키워드 태그 목록', example: ['재활', '골프'] })
  keywordTags: string[] | null;

  @ApiPropertyOptional({ description: '경력 텍스트', example: '2018-현재 강남 스포츠 클리닉 원장' })
  careerText: string | null;

  @ApiPropertyOptional({ description: '학력 PDF URL', example: 'https://cdn.example.com/edu/1.pdf' })
  educationPdfUrl: string | null;

  @ApiPropertyOptional({ description: '리뷰 수 기준 상위 백분위 (전체 명인 중 상위 N%)', example: 15 })
  topPercentile: number | null;

  @ApiProperty({ description: '생성일', example: '2024-01-15T09:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', example: '2024-06-01T12:00:00.000Z' })
  updatedAt: Date;
}

export class ExpertListItemDto {
  @ApiProperty({ description: '명인 프로필 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '이름', example: '김명인' })
  name: string;

  @ApiPropertyOptional({ description: '등급', example: 'gold' })
  grade: string | null;

  @ApiProperty({ description: '리뷰 수', example: 42 })
  reviewCount: number;

  @ApiProperty({ description: '평균 별점', example: 4.8 })
  avgRating: number;

  @ApiPropertyOptional({ description: '프로필 사진 URL', example: 'https://cdn.example.com/avatar/1.jpg' })
  avatarUrl: string | null;

  @ApiProperty({ description: '지역', example: '서울 강남구' })
  region: string;

  @ApiProperty({ description: '대표 서비스', example: '재활 트레이닝' })
  representativeService: string;
}

export class OpenChatUrlResponseDto {
  @ApiProperty({ description: '카카오 오픈채팅 URL', example: 'https://open.kakao.com/o/example' })
  openChatUrl: string;

  @ApiProperty({ description: '명인 이름', example: '김명인' })
  expertName: string;

  @ApiProperty({ description: '명인 개인 코드', example: 'USR-000001' })
  personalCode: string;
}

export class ShareLinkResponseDto {
  @ApiProperty({ description: '공유 URL', example: 'https://sportsmaster.app/expert/1' })
  shareUrl: string;
}

export class ImageUploadResponseDto {
  @ApiProperty({ description: '업로드된 이미지 URL 목록', example: ['https://cdn.example.com/img/1.jpg'] })
  imageUrls: string[];
}

export class AvatarResponseDto {
  @ApiProperty({ description: '프로필 사진 URL', example: 'https://cdn.example.com/avatar/1.jpg' })
  avatarUrl: string;
}

export class CareerResponseDto {
  @ApiProperty({ description: '경력 텍스트', example: '2018-현재 강남 스포츠 클리닉 원장' })
  careerText: string;
}
