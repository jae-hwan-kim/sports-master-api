import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';

export enum AdPlanType {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export class CreateAdCampaignDto {
  @ApiProperty({ description: '광고 시작일 (ISO8601)', example: '2024-07-01T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: '광고 종료일 (ISO8601)', example: '2024-07-31T23:59:59.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ description: '광고 플랜 종류', enum: AdPlanType, example: AdPlanType.BASIC })
  @IsEnum(AdPlanType)
  @IsNotEmpty()
  planType: AdPlanType;
}
