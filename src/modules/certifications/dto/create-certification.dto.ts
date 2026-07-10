import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum CertificationType {
  LICENSE = 'license',
  GRADUATION = 'graduation',
}

export enum LicenseType {
  PT = 'PT',
  HEALTH_EXERCISE = 'healthExercise',
}

export class CreateCertificationDto {
  @ApiProperty({ description: '자격증 종류', enum: CertificationType, example: CertificationType.LICENSE })
  @IsEnum(CertificationType)
  @IsNotEmpty()
  type: CertificationType;

  @ApiPropertyOptional({
    description: '자격증 세부 종류 (type=license 시)',
    enum: LicenseType,
    example: LicenseType.PT,
  })
  @IsEnum(LicenseType)
  @IsOptional()
  licenseType?: LicenseType;
}
