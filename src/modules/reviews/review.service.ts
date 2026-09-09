import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { Review } from './review.entity';
import { ReviewDeleteRequest, DeleteRequestStatus } from './review-delete-request.entity';
import {
  DeleteRequestResponseDto,
  PaginatedReviewsDto,
  ReviewResponseDto,
  ReviewSummaryDto,
} from './dto/review-response.dto';

export type ReviewSortType = 'latest' | 'best';

export interface ReviewListQuery {
  sort?: ReviewSortType;
  photoOnly?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewDeleteRequest)
    private readonly deleteRequestRepository: Repository<ReviewDeleteRequest>,
    @InjectRepository(ExpertProfile)
    private readonly expertProfileRepository: Repository<ExpertProfile>,
  ) {}

  async getMyReviews(userId: number, query: ReviewListQuery): Promise<PaginatedReviewsDto> {
    const expertProfile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!expertProfile) throw new NotFoundException('명인 프로필이 없습니다.');

    const { sort = 'latest', photoOnly = false, page = 1, limit = 20 } = query;

    const qb = this.reviewRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.customer', 'customer')
      .leftJoinAndSelect('r.deleteRequests', 'dr', "dr.status = 'pending'")
      .where('r.expertProfileId = :expertProfileId', { expertProfileId: expertProfile.id });

    if (photoOnly) {
      qb.andWhere('jsonb_array_length(r."imageUrls") > 0');
    }

    if (sort === 'best') {
      qb.orderBy('r.rating', 'DESC').addOrderBy('r.createdAt', 'DESC');
    } else {
      qb.orderBy('r.createdAt', 'DESC');
    }

    const [reviews, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data: reviews.map(r => this.toReviewDto(r)), total };
  }

  async getMySummary(userId: number): Promise<ReviewSummaryDto> {
    const expertProfile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!expertProfile) throw new NotFoundException('명인 프로필이 없습니다.');

    const rows: { rating: string; count: string }[] = await this.reviewRepository
      .createQueryBuilder('r')
      .select('r.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('r.expertProfileId = :id', { id: expertProfile.id })
      .groupBy('r.rating')
      .getRawMany();

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalCount = 0;
    let ratingSum = 0;

    for (const row of rows) {
      const rating = Number(row.rating);
      const count = Number(row.count);
      distribution[rating] = count;
      totalCount += count;
      ratingSum += rating * count;
    }

    const averageRating = totalCount > 0 ? Math.round((ratingSum / totalCount) * 10) / 10 : 0;

    const photoReviewCount = await this.reviewRepository
      .createQueryBuilder('r')
      .where('r.expertProfileId = :id', { id: expertProfile.id })
      .andWhere('jsonb_array_length(r."imageUrls") > 0')
      .getCount();

    return { averageRating, ratingDistribution: distribution, totalCount, photoReviewCount };
  }

  async createDeleteRequest(reviewId: number, requestedById: number): Promise<DeleteRequestResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: { expertProfile: true },
    });
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    const isCustomer = review.customerId === requestedById;
    const isMaster = review.expertProfile?.userId === requestedById;
    if (!isCustomer && !isMaster) throw new ForbiddenException('리뷰 삭제를 요청할 권한이 없습니다.');

    const existing = await this.deleteRequestRepository.findOne({
      where: { reviewId, requestedById, status: DeleteRequestStatus.PENDING },
    });
    if (existing) return this.toDeleteRequestDto(existing);

    const req = this.deleteRequestRepository.create({ reviewId, requestedById });
    const saved = await this.deleteRequestRepository.save(req);
    return this.toDeleteRequestDto(saved);
  }

  private toReviewDto(review: Review): ReviewResponseDto {
    const deleteRequested = !!(review.deleteRequests && review.deleteRequests.length > 0);
    return {
      id: review.id,
      rating: review.rating,
      content: review.comment,
      createdAt: review.createdAt,
      customerNickname: review.customer?.nickname ?? null,
      customerProfileImageUrl: review.customer?.profileImageUrl ?? null,
      imageUrls: review.imageUrls ?? [],
      deleteRequested,
    };
  }

  private toDeleteRequestDto(req: ReviewDeleteRequest): DeleteRequestResponseDto {
    return {
      id: req.id,
      reviewId: req.reviewId,
      status: req.status,
      requestedAt: req.requestedAt,
    };
  }
}
