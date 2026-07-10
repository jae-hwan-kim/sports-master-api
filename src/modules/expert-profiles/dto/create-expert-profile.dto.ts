import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExpertProfileDto {
  @ApiProperty({ description: '활동 지역', example: '서울 강남구' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ description: '센터명', example: '강남 스포츠 클리닉' })
  @IsString()
  @IsNotEmpty()
  centerName: string;

  @ApiProperty({ description: '대표 서비스', example: '재활 트레이닝' })
  @IsString()
  @IsNotEmpty()
  representativeService: string;

  @ApiPropertyOptional({ description: '소개 텍스트', example: '10년 경력의 재활 전문 트레이너입니다.' })
  @IsString()
  @IsOptional()
  bio?: string;
}
