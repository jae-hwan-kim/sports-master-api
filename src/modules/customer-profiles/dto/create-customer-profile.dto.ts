import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class CreateCustomerProfileDto {
  @ApiProperty({ description: '활동명 (닉네임)', example: '스포츠러버' })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiPropertyOptional({ description: '나이', example: 28 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  age?: number;

  @ApiPropertyOptional({ description: '성별', enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ description: '지역', example: '서울 강남구' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiPropertyOptional({ description: '운동 종목 목록', example: ['골프', '테니스'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sports?: string[];

  @ApiPropertyOptional({ description: '증상/불편 부위 목록', example: ['허리', '무릎'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  symptoms?: string[];

  @ApiPropertyOptional({ description: '키워드 태그 목록 (최대 5개)', example: ['재활', '체형교정'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}
