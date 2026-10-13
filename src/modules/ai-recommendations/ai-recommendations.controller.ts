import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiRecommendationResponseDto } from './dto/ai-recommendation-response.dto';
import { AiRecommendationsService } from './ai-recommendations.service';

interface AuthenticatedRequest {
  user: { id: number };
}

@ApiTags('recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class AiRecommendationsController {
  constructor(private readonly service: AiRecommendationsService) {}

  @ApiOperation({ summary: '맞춤 명인 추천 (온보딩 기반, 최대 3명)' })
  @ApiDataResponse(AiRecommendationResponseDto)
  @Get('masters')
  getRecommendedMasters(@Req() req: AuthenticatedRequest) {
    return this.service.getRecommendedMasters(req.user.id);
  }
}
