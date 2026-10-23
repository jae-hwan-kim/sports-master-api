import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeaturedExpertDto {
  @ApiProperty({ description: '명인 프로필 ID', example: 5 })
  id: number;

  @ApiProperty({ description: '센터명', example: '아쿠아퍼포먼스' })
  name: string;

  @ApiPropertyOptional({ description: '한줄 소개', example: '국가대표 출신 재활 트레이너' })
  introduction: string | null;

  @ApiProperty({ description: '지역', example: '경기 고양시 일산서구' })
  region: string;

  @ApiPropertyOptional({ description: '키워드 태그', example: ['방문재활', '선수트레이닝'] })
  keywordTags: string[] | null;

  @ApiPropertyOptional({ description: '대표 이미지 URL', example: 'https://cdn.example.com/expert/5.jpg' })
  imageUrl: string | null;

  @ApiProperty({ description: '등급', example: 'gold', nullable: true })
  expertGrade: string | null;
}
