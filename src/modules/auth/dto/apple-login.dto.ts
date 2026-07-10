import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AppleLoginDto {
  @ApiProperty({ description: '애플 identityToken', example: 'eyJraWQiOiJ...' })
  @IsString()
  @IsNotEmpty()
  identityToken: string;

  @ApiProperty({ description: '애플 authorizationCode', example: 'c7f9e2d1...' })
  @IsString()
  @IsNotEmpty()
  authorizationCode: string;
}
