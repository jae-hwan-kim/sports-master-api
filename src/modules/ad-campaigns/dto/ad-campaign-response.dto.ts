import { ApiProperty } from '@nestjs/swagger';

export class AdCampaignResponseDto {
  @ApiProperty({ description: '광고 캠페인 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '상태', enum: ['pending', 'active', 'expired', 'cancelled'], example: 'pending' })
  status: string;

  @ApiProperty({ description: '청구 금액', example: 50000 })
  amount: number;

  @ApiProperty({ description: '광고 시작일', example: '2024-07-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ description: '광고 종료일', example: '2024-07-31T23:59:59.000Z' })
  endDate: Date;
}
