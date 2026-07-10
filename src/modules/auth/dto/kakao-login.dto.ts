import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class KakaoLoginDto {
  @ApiProperty({ description: '카카오 인가코드', example: 'abc123def456' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
