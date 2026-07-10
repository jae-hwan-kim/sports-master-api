import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({ description: '활동명 (닉네임)', example: '운동왕' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: '나이', example: 29 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  age?: number;

  @ApiPropertyOptional({ description: '지역', example: '서울 서초구' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ description: '운동 종목 목록', example: ['수영', '골프'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sports?: string[];

  @ApiPropertyOptional({ description: '증상/불편 부위 목록', example: ['어깨'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  symptoms?: string[];

  @ApiPropertyOptional({ description: '키워드 태그 목록', example: ['재활'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}
