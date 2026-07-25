import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AppleLoginDto {
  @ApiProperty({ description: '애플 identityToken (서버에서 서명 검증에 사용)', example: 'eyJraWQiOiJ...' })
  @IsString()
  @IsNotEmpty()
  identityToken: string;

  @ApiPropertyOptional({
    description: '애플 authorizationCode (현재 서버에서 사용하지 않음 — 향후 애플 refresh token 교환용으로 예약)',
    example: 'c7f9e2d1...',
  })
  @IsString()
  @IsOptional()
  authorizationCode?: string;
}
