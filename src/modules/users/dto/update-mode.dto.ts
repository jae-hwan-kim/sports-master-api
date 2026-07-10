import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum UserMode {
  EXPERT = 'expert',
  CUSTOMER = 'customer',
}

export class UpdateModeDto {
  @ApiProperty({ description: '전환할 모드', enum: UserMode, example: UserMode.EXPERT })
  @IsEnum(UserMode)
  @IsNotEmpty()
  mode: UserMode;
}
