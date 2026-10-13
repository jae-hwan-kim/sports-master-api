import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateDiagnosisRequestDto {
  @ApiProperty({ description: '진단 요청할 명인 프로필 ID', example: 5 })
  @IsInt()
  @IsPositive()
  expertProfileId: number;
}
