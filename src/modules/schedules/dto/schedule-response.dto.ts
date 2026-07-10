import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduleResponseDto {
  @ApiProperty({ description: '스케줄 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '제목', example: '강남 스포츠 클리닉 예약' })
  title: string;

  @ApiProperty({ description: '날짜', example: '2024-07-15T10:00:00.000Z' })
  date: Date;

  @ApiProperty({ description: '완료 여부', example: false })
  isChecked: boolean;

  @ApiPropertyOptional({ description: '메모', example: '재활 트레이닝 1회차' })
  memo: string | null;
}
