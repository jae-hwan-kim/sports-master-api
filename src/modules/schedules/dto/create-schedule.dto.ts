import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ description: '스케줄 제목', example: '강남 스포츠 클리닉 예약' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '날짜 (ISO8601)', example: '2024-07-15T10:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({ description: '메모', example: '재활 트레이닝 1회차' })
  @IsString()
  @IsOptional()
  memo?: string;
}
