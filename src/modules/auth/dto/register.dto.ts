import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum UserMode {
  EXPERT = 'expert',
  CUSTOMER = 'customer',
}

export class RegisterDto {
  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '비밀번호 (8~12자, 특수문자 사용 가능)', example: 'P@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(12)
  password: string;

  @ApiProperty({ description: '닉네임', example: '김운동' })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiPropertyOptional({ description: '전화번호', example: '010-1234-5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '가입 모드 (미입력 시 customer)', enum: UserMode, example: UserMode.CUSTOMER })
  @IsOptional()
  @IsEnum(UserMode)
  mode?: UserMode;
}
