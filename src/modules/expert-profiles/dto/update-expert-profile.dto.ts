import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUrl, Matches, ValidateIf } from 'class-validator';

export class UpdateExpertProfileDto {
  @ApiPropertyOptional({ description: '활동 지역', example: '서울 서초구' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ description: '센터명', example: '서초 헬스케어' })
  @IsString()
  @IsOptional()
  centerName?: string;

  @ApiPropertyOptional({ description: '대표 서비스', example: '골프 퍼포먼스 향상' })
  @IsString()
  @IsOptional()
  representativeService?: string;

  @ApiPropertyOptional({ description: '소개 텍스트', example: '스포츠 재활 전문가입니다.' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: '경력 텍스트 (줄바꿈 구분)', example: '2018-현재 강남 스포츠 클리닉 원장' })
  @IsString()
  @IsOptional()
  careerText?: string;

  @ApiPropertyOptional({ description: '키워드 태그 목록', example: ['재활', '골프', '체형교정'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywordTags?: string[];

  @ApiPropertyOptional({
    description: '소개 이미지 URL 목록 (최대 3장, 첫 장이 대표) — POST me/uploads?kind=image 결과 URL만 허용',
    type: [String],
  })
  @IsArray()
  @ArrayMaxSize(3)
  @IsUrl({}, { each: true })
  @IsOptional()
  portfolioImageUrls?: string[];

  @ApiPropertyOptional({
    description: '포트폴리오 PDF URL — POST me/uploads?kind=pdf 결과 URL, 빈 문자열이면 삭제',
    example: 'https://files.example.com/experts/1/pdf/uuid.pdf',
  })
  @ValidateIf((_, value) => value !== '')
  @IsUrl()
  @IsOptional()
  educationPdfUrl?: string;

  @ApiPropertyOptional({
    description: '프로필 대표 사진 URL — POST me/uploads?kind=image 결과 URL, 빈 문자열이면 삭제',
    example: 'https://files.example.com/experts/1/images/uuid.jpg',
  })
  @ValidateIf((_, value) => value !== '')
  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;

  @ApiPropertyOptional({ description: '센터 연락처 (숫자만 9~11자리), 빈 문자열이면 삭제', example: '01012345678' })
  @ValidateIf((_, value) => value !== '')
  @Matches(/^0\d{8,10}$/, { message: '연락처는 0으로 시작하는 숫자 9~11자리여야 합니다.' })
  @IsOptional()
  centerPhone?: string;

  @ApiPropertyOptional({ description: '카카오 오픈채팅 URL', example: 'https://open.kakao.com/o/example' })
  @IsUrl()
  @IsOptional()
  openChatUrl?: string;
}
