import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewTokenDto {
  @ApiProperty({ description: '채팅방 ID', example: 1 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
  chatRoomId: number;
}
