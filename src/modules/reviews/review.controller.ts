import { Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DeleteRequestResponseDto, PaginatedReviewsDto, ReviewSummaryDto } from './dto/review-response.dto';
import { ReviewsService } from './review.service';

interface AuthenticatedRequest {
  user: { id: number };
}

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: '내 리뷰 목록 조회 (명인 전용)' })
  @ApiQuery({ name: 'sort', enum: ['latest', 'best'], required: false })
  @ApiQuery({ name: 'photoOnly', type: Boolean, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiDataResponse(PaginatedReviewsDto)
  @Get('me')
  getMyReviews(
    @Req() req: AuthenticatedRequest,
    @Query('sort') sort?: 'latest' | 'best',
    @Query('photoOnly', new ParseBoolPipe({ optional: true })) photoOnly?: boolean,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.reviewsService.getMyReviews(req.user.id, { sort, photoOnly, page, limit });
  }

  @ApiOperation({ summary: '내 리뷰 요약 조회 (명인 전용)' })
  @ApiDataResponse(ReviewSummaryDto)
  @Get('me/summary')
  getMySummary(@Req() req: AuthenticatedRequest) {
    return this.reviewsService.getMySummary(req.user.id);
  }

  @ApiOperation({ summary: '리뷰 삭제 요청 (본인 리뷰만)' })
  @ApiDataResponse(DeleteRequestResponseDto)
  @Post(':id/delete-request')
  createDeleteRequest(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.createDeleteRequest(id, req.user.id);
  }
}
