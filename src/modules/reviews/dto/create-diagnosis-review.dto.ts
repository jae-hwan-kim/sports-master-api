import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiagnosisReviewDto {
  @ApiProperty({ description: '명인 프로필 ID', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  expertProfileId: number;

  @ApiProperty({ description: '별점 (1~5)', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({ description: '리뷰 코멘트', example: '정말 도움이 되었습니다!' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  comment?: string;

  @ApiPropertyOptional({ description: '리뷰 요청 링크 토큰 — 있으면 진단요청 이력 없이 작성 가능 (명인이 보낸 링크)' })
  @IsString()
  @IsOptional()
  reviewToken?: string;
}
