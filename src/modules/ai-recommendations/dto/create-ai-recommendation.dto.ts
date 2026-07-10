import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum AiGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class CreateAiRecommendationDto {
  @ApiProperty({ description: '나이', example: 35 })
  @IsInt()
  @Min(0)
  @Max(120)
  @IsNotEmpty()
  @Type(() => Number)
  age: number;

  @ApiProperty({ description: '성별', enum: AiGender, example: AiGender.MALE })
  @IsEnum(AiGender)
  @IsNotEmpty()
  gender: AiGender;

  @ApiProperty({ description: '지역', example: '서울 강남구' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ description: '운동종목', example: '골프' })
  @IsString()
  @IsNotEmpty()
  sport: string;

  @ApiProperty({ description: '통증/불편 부위', example: '허리' })
  @IsString()
  @IsNotEmpty()
  painArea: string;

  @ApiProperty({ description: '주간 운동 횟수', example: 3, minimum: 0, maximum: 7 })
  @IsInt()
  @Min(0)
  @Max(7)
  @IsNotEmpty()
  @Type(() => Number)
  weeklyFrequency: number;
}
