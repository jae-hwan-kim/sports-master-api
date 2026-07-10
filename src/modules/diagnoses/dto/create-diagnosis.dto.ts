import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiagnosisDto {
  @ApiProperty({ description: '명인 ID', example: 5 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
  expertId: number;
}
