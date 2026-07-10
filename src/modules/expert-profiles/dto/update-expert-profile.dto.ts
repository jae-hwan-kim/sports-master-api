import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateExpertProfileDto {
  @ApiPropertyOptional({ description: '활동 지역', example: '서울 서초구' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ description: '센터명', example: '서초 헬스케어' })
  @IsString()
  @IsOptional()
  centerName?: string;

  @ApiPropertyOptional({ description: '대표 서비스', example: '골프 퍼포먼스 향상' })
  @IsString()
  @IsOptional()
  representativeService?: string;

  @ApiPropertyOptional({ description: '소개 텍스트', example: '스포츠 재활 전문가입니다.' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: '키워드 태그 목록', example: ['재활', '골프', '체형교정'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywordTags?: string[];

  @ApiPropertyOptional({ description: '카카오 오픈채팅 URL', example: 'https://open.kakao.com/o/example' })
  @IsUrl()
  @IsOptional()
  openChatUrl?: string;
}
