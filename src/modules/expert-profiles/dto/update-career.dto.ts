import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCareerDto {
  @ApiProperty({
    description: '경력 텍스트',
    example: '2018-2020 XX 스포츠센터 트레이너\n2021-현재 강남 스포츠 클리닉 원장',
  })
  @IsString()
  @IsNotEmpty()
  careerText: string;
}
