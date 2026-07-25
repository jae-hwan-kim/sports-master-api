import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DiagnosisIncomingItemDto } from '../diagnoses/dto/diagnosis-response.dto';
import { ExpertProfileResponseDto } from '../expert-profiles/dto/expert-profile-response.dto';
import { CreateReviewTokenDto } from '../reviews/dto/create-review-token.dto';
import { ReviewTokenResponseDto } from '../reviews/dto/review-response.dto';
import { UpdateModeDto } from '../users/dto/update-mode.dto';
import { UpdateModeResponseDto } from '../users/dto/user-response.dto';
import { HomeService } from './home.service';

interface AuthenticatedRequest {
  user: { id: number };
}

@ApiTags('home')
@Controller('home')
@UseGuards(JwtAuthGuard)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @ApiOperation({ summary: '명인 홈: 명인등급 조회 (리뷰수/별점/등급)' })
  @ApiDataResponse(ExpertProfileResponseDto)
  @Get('expert-grade')
  getExpertGrade(@Req() req: AuthenticatedRequest) {
    return this.homeService.getExpertGrade(req.user.id);
  }

  @ApiOperation({ summary: '명인 홈: 리뷰 요청 링크 생성 (카카오 딥링크)' })
  @ApiDataResponse(ReviewTokenResponseDto)
  @Post('review-request')
  createReviewRequestLink(@Req() req: AuthenticatedRequest, @Body() dto: CreateReviewTokenDto) {
    return this.homeService.createReviewRequestLink(req.user.id, dto);
  }

  @ApiOperation({ summary: '명인 홈: 요청진단 미리보기 (신청순 최대 3개)' })
  @ApiDataResponse(DiagnosisIncomingItemDto, { isArray: true })
  @Get('diagnosis-requests/preview')
  getDiagnosisPreview(@Req() req: AuthenticatedRequest) {
    return this.homeService.getDiagnosisPreview(req.user.id);
  }

  @ApiOperation({ summary: '홈: 명인/고객 모드 전환' })
  @ApiDataResponse(UpdateModeResponseDto)
  @Patch('mode')
  switchMode(@Req() req: AuthenticatedRequest, @Body() dto: UpdateModeDto) {
    return this.homeService.switchMode(req.user.id, dto);
  }
}
