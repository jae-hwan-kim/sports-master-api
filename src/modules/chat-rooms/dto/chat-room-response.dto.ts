import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatRoomCounterpartDto {
  @ApiProperty({ description: '상대방 ID', example: 3 })
  id: number;

  @ApiProperty({ description: '상대방 이름', example: '김고객' })
  name: string;

  @ApiPropertyOptional({ description: '프로필 사진 URL', example: 'https://cdn.example.com/avatar/3.jpg' })
  avatarUrl: string | null;
}

export class ChatRoomResponseDto {
  @ApiProperty({ description: '채팅방 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '상대방 정보' })
  counterpart: ChatRoomCounterpartDto;

  @ApiProperty({ description: '채팅 상태', enum: ['pending', 'active', 'done'], example: 'active' })
  status: string;

  @ApiPropertyOptional({ description: '마지막 메시지', example: '안녕하세요!' })
  lastMessage: string | null;

  @ApiProperty({ description: '최근 업데이트', example: '2024-06-01T10:00:00.000Z' })
  updatedAt: Date;
}

export class ReviewRequestUrlResponseDto {
  @ApiProperty({ description: '리뷰 요청 딥링크 URL', example: 'sportsmaster://review?token=abc123' })
  reviewRequestUrl: string;
}
