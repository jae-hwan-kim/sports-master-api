import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

// 명인탐색 필터 — 전부 선택. 개별 @Query('minRating') + 전역 ValidationPipe(transform) 조합은
// 값이 없을 때 +undefined = NaN 으로 바뀌어 400이 나므로 DTO로 받는다.
export class ListExpertsQueryDto {
  @ApiPropertyOptional({ description: '검색어 (센터명·대표서비스·닉네임)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: "지역 ('시/도' 또는 '시/도 > 구')" })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '최소 평점', minimum: 0, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;
}
