import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class WithdrawDto {
  @ApiPropertyOptional({ description: '비밀번호 (소셜 로그인 사용자는 불필요)', example: 'P@ssw0rd!' })
  @IsString()
  @IsOptional()
  password?: string;
}
