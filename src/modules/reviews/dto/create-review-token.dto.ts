import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewTokenDto {
  @ApiPropertyOptional({ description: '채팅방 ID — 생략 시 명인 단위 링크 생성 (명인홈 링크 복사)', example: 1 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  chatRoomId?: number;
}
