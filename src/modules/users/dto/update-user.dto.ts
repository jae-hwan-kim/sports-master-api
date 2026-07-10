import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '전화번호', example: '010-9876-5432' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '변경할 이메일', example: 'new@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '현재 비밀번호 (비밀번호 변경 시 필수)', example: 'OldP@ss1!' })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiPropertyOptional({ description: '새 비밀번호 (최소 8자)', example: 'NewP@ss2!' })
  @IsString()
  @IsOptional()
  @MinLength(8)
  newPassword?: string;
}
