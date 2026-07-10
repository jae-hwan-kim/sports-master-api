import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export enum UserMode {
  EXPERT = 'expert',
  CUSTOMER = 'customer',
}

export class RegisterDto {
  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '비밀번호 (최소 8자)', example: 'P@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: '이름', example: '김운동' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '전화번호', example: '010-1234-5678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: '가입 모드', enum: UserMode, example: UserMode.CUSTOMER })
  @IsEnum(UserMode)
  @IsNotEmpty()
  mode: UserMode;
}
