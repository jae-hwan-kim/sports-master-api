import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateDiagnosisReviewDto } from './dto/create-diagnosis-review.dto';
import {
  DeleteRequestResponseDto,
  PaginatedReviewsDto,
  ReviewCreatedDto,
  ReviewResponseDto,
  ReviewSummaryDto,
} from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './review.service';

interface AuthenticatedRequest {
  user: { id: number };
}

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: '리뷰 생성 (고객용) — 진단요청한 명인에 대해 작성' })
  @ApiDataResponse(ReviewCreatedDto)
  @Post()
  createReview(@Req() req: AuthenticatedRequest, @Body() dto: CreateDiagnosisReviewDto) {
    return this.reviewsService.createReview(req.user.id, dto);
  }

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

  @ApiOperation({ summary: '특정 명인의 리뷰 목록 (고객의 명인 상세 리뷰 보기)' })
  @ApiQuery({ name: 'sort', enum: ['latest', 'best'], required: false })
  @ApiQuery({ name: 'photoOnly', type: Boolean, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiDataResponse(PaginatedReviewsDto)
  @Get('experts/:expertProfileId')
  getExpertReviews(
    @Param('expertProfileId', ParseIntPipe) expertProfileId: number,
    @Query('sort') sort?: 'latest' | 'best',
    @Query('photoOnly', new ParseBoolPipe({ optional: true })) photoOnly?: boolean,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.reviewsService.getExpertReviews(expertProfileId, { sort, photoOnly, page, limit });
  }

  @ApiOperation({ summary: '특정 명인의 리뷰 요약' })
  @ApiDataResponse(ReviewSummaryDto)
  @Get('experts/:expertProfileId/summary')
  getExpertSummary(@Param('expertProfileId', ParseIntPipe) expertProfileId: number) {
    return this.reviewsService.getExpertSummary(expertProfileId);
  }

  @ApiOperation({ summary: '내가 쓴 리뷰 목록 (고객 전용)' })
  @ApiQuery({ name: 'sort', enum: ['latest', 'best'], required: false })
  @ApiQuery({ name: 'photoOnly', type: Boolean, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiDataResponse(PaginatedReviewsDto)
  @Get('written-by-me')
  getMyWrittenReviews(
    @Req() req: AuthenticatedRequest,
    @Query('sort') sort?: 'latest' | 'best',
    @Query('photoOnly', new ParseBoolPipe({ optional: true })) photoOnly?: boolean,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.reviewsService.getMyWrittenReviews(req.user.id, { sort, photoOnly, page, limit });
  }

  @ApiOperation({ summary: '리뷰 수정 (본인 리뷰만)' })
  @ApiDataResponse(ReviewResponseDto)
  @Patch(':id')
  updateReview(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.updateReview(id, req.user.id, dto);
  }

  @ApiOperation({ summary: '리뷰 삭제 요청 (본인 리뷰만)' })
  @ApiDataResponse(DeleteRequestResponseDto)
  @Post(':id/delete-request')
  createDeleteRequest(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.createDeleteRequest(id, req.user.id);
  }
}
