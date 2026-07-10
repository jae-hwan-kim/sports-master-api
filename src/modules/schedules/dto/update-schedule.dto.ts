import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateScheduleDto {
  @ApiPropertyOptional({ description: '스케줄 제목', example: '수정된 예약' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '날짜 (ISO8601)', example: '2024-07-20T10:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: '완료 여부 (체크박스 토글)', example: true })
  @IsBoolean()
  @IsOptional()
  isChecked?: boolean;

  @ApiPropertyOptional({ description: '메모', example: '변경된 메모' })
  @IsString()
  @IsOptional()
  memo?: string;
}
