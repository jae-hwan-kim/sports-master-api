import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum CertificationStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdateCertificationStatusDto {
  @ApiProperty({ description: '검수 결과', enum: CertificationStatus, example: CertificationStatus.APPROVED })
  @IsEnum(CertificationStatus)
  @IsNotEmpty()
  status: CertificationStatus;

  @ApiPropertyOptional({ description: '반려 사유 (rejected 시)', example: '이미지가 불명확합니다.' })
  @IsString()
  @IsOptional()
  rejectReason?: string;
}
