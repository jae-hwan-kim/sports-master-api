import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum ChatRoomStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DONE = 'done',
}

export class UpdateChatRoomStatusDto {
  @ApiProperty({ description: '변경할 채팅 상태', enum: ChatRoomStatus, example: ChatRoomStatus.ACTIVE })
  @IsEnum(ChatRoomStatus)
  @IsNotEmpty()
  status: ChatRoomStatus;
}
