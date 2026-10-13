import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FavoriteStatusDto {
  @ApiProperty({ description: '찜 여부', example: true })
  isFavorited: boolean;

  @ApiPropertyOptional({ description: '찜 레코드 ID (찜 중인 경우에만 존재)', example: 7, nullable: true })
  favoriteId: number | null;
}
