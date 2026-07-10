import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({ description: '포트폴리오 제목', example: '국가대표 선수 재활 지도' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '포트폴리오 설명', example: '2023년 국가대표 야구팀 체계적 재활 프로그램 진행' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: '포트폴리오 이미지 URL', example: 'https://cdn.example.com/portfolio/1.jpg' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
