import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEducationDto {
  @ApiProperty({ description: '학교명 (multipart/form-data)', example: '한국체육대학교' })
  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @ApiProperty({ description: '전공', example: '체육학과' })
  @IsString()
  @IsNotEmpty()
  major: string;

  @ApiProperty({ description: '학위', example: '학사' })
  @IsString()
  @IsNotEmpty()
  degree: string;
}
