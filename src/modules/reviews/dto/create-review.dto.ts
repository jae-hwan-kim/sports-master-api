import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({ description: '명인 ID', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  expertId: number;

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
  comment?: string;

  @ApiProperty({ description: '리뷰 요청 토큰 (딥링크 팝업 인증용)', example: 'abc123reviewtoken' })
  @IsString()
  @IsNotEmpty()
  reviewToken: string;
}
