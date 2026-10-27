import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { requireEnv } from '../../common/config/require-env';
import { ChatRoom } from '../chat-rooms/chat-room.entity';
import { DiagnosisRequest, DiagnosisStatus } from '../diagnoses/diagnosis-request.entity';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { Review } from './review.entity';
import { ReviewDeleteRequest, DeleteRequestStatus } from './review-delete-request.entity';
import {
  DeleteRequestResponseDto,
  PaginatedReviewsDto,
  ReviewLinkInfoDto,
  ReviewResponseDto,
  ReviewSummaryDto,
} from './dto/review-response.dto';
import { CreateDiagnosisReviewDto } from './dto/create-diagnosis-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ensureExpertProfile, expertDisplayName } from '../expert-profiles/ensure-expert-profile';

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
    @InjectRepository(DiagnosisRequest)
    private readonly diagnosisRequestRepository: Repository<DiagnosisRequest>,
    @InjectRepository(ChatRoom) private readonly chatRoomRepository: Repository<ChatRoom>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // 리뷰 요청 링크 토큰 → 명인 프로필 ID (명인 단위 / 채팅방 단위 토큰 모두 지원)
  private async resolveReviewToken(token: string): Promise<number> {
    const invalid = new BadRequestException('만료되었거나 올바르지 않은 리뷰 링크입니다.');
    let payload: { typ?: string; expertProfileId?: number; chatRoomId?: number };
    try {
      payload = await this.jwtService.verifyAsync(token, { secret: requireEnv(this.config, 'JWT_ACCESS_SECRET') });
    } catch {
      throw invalid;
    }
    if (payload.typ !== 'review') throw invalid;
    if (payload.expertProfileId) return payload.expertProfileId;
    if (payload.chatRoomId) {
      const chatRoom = await this.chatRoomRepository.findOne({ where: { id: payload.chatRoomId } });
      if (chatRoom) return chatRoom.expertProfileId;
    }
    throw invalid;
  }

  async getReviewLinkInfo(userId: number, token: string): Promise<ReviewLinkInfoDto> {
    const expertProfileId = await this.resolveReviewToken(token);
    const expert = await this.expertProfileRepository.findOne({
      where: { id: expertProfileId },
      relations: { user: true },
    });
    if (!expert) throw new NotFoundException('명인 프로필이 없습니다.');
    const existing = await this.reviewRepository.findOne({ where: { customerId: userId, expertProfileId } });
    return {
      expertProfileId,
      expertName: expertDisplayName(expert),
      expertAvatarUrl: expert.profileImageUrl ?? expert.portfolioImageUrls?.[0] ?? null,
      expertGrade: expert.expertGrade,
      isMine: expert.userId === userId,
      alreadyReviewed: !!existing,
    };
  }

  async createReview(userId: number, dto: CreateDiagnosisReviewDto): Promise<{ id: number }> {
    const expert = await this.expertProfileRepository.findOne({ where: { id: dto.expertProfileId } });
    if (!expert) throw new NotFoundException('명인 프로필이 없습니다.');
    if (expert.userId === userId) throw new ForbiddenException('본인에게는 리뷰를 작성할 수 없습니다.');

    // 명인이 보낸 리뷰 링크로 들어온 경우 진단요청 이력 없이도 작성 가능 (외부 고객)
    if (dto.reviewToken) {
      const tokenExpertId = await this.resolveReviewToken(dto.reviewToken);
      if (tokenExpertId !== dto.expertProfileId) {
        throw new BadRequestException('리뷰 링크의 명인과 일치하지 않습니다.');
      }
    } else {
      const diagnosisExists = await this.diagnosisRequestRepository.findOne({
        where: { customerId: userId, expertProfileId: dto.expertProfileId, status: Not(DiagnosisStatus.DELETED) },
      });
      if (!diagnosisExists) {
        throw new NotFoundException('해당 명인에게 진단 요청한 내역이 없습니다.');
      }
    }

    const existing = await this.reviewRepository.findOne({
      where: { customerId: userId, expertProfileId: dto.expertProfileId },
    });
    if (existing) throw new ConflictException('이미 해당 명인에게 리뷰를 작성하셨습니다.');

    const review = this.reviewRepository.create({
      customerId: userId,
      expertProfileId: dto.expertProfileId,
      rating: dto.rating,
      comment: dto.comment ?? null,
      chatRoomId: null,
      imageUrls: [],
    });
    const saved = await this.reviewRepository.save(review);
    await this.refreshExpertStats(dto.expertProfileId);
    return { id: saved.id };
  }

  async getMyReviews(userId: number, query: ReviewListQuery): Promise<PaginatedReviewsDto> {
    const expertProfile = await ensureExpertProfile(this.expertProfileRepository.manager, userId);
    return this.getExpertReviews(expertProfile.id, query);
  }

  async getMySummary(userId: number): Promise<ReviewSummaryDto> {
    const expertProfile = await ensureExpertProfile(this.expertProfileRepository.manager, userId);
    return this.getExpertSummary(expertProfile.id);
  }

  // 특정 명인의 리뷰 목록 — 명인 본인(me)과 고객의 명인 상세 '리뷰 보기'가 공용
  async getExpertReviews(expertProfileId: number, query: ReviewListQuery): Promise<PaginatedReviewsDto> {
    const { sort = 'latest', photoOnly = false, page = 1, limit = 20 } = query;

    const qb = this.reviewRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.customer', 'customer')
      .leftJoinAndSelect('r.deleteRequests', 'dr', "dr.status = 'pending'")
      .where('r.expertProfileId = :expertProfileId', { expertProfileId });

    if (photoOnly) {
      qb.andWhere('jsonb_array_length(r."imageUrls") > 0');
    }

    if (sort === 'best') {
      qb.orderBy('r.rating', 'DESC').addOrderBy('r.createdAt', 'DESC');
    } else {
      qb.orderBy('r.createdAt', 'DESC');
    }

    const [reviews, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data: reviews.map(r => this.toReviewDto(r)), total };
  }

  async getExpertSummary(expertProfileId: number): Promise<ReviewSummaryDto> {
    const rows: { rating: string; count: string }[] = await this.reviewRepository
      .createQueryBuilder('r')
      .select('r.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('r.expertProfileId = :id', { id: expertProfileId })
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
      .where('r.expertProfileId = :id', { id: expertProfileId })
      .andWhere('jsonb_array_length(r."imageUrls") > 0')
      .getCount();

    return { averageRating, ratingDistribution: distribution, totalCount, photoReviewCount };
  }

  async getMyWrittenReviews(customerId: number, query: ReviewListQuery): Promise<PaginatedReviewsDto> {
    const { sort = 'latest', photoOnly = false, page = 1, limit = 20 } = query;

    const qb = this.reviewRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.customer', 'customer')
      .leftJoinAndSelect('r.deleteRequests', 'dr', "dr.status = 'pending'")
      .leftJoinAndSelect('r.expertProfile', 'ep')
      .leftJoinAndSelect('ep.user', 'epUser')
      .where('r.customerId = :customerId', { customerId });

    if (photoOnly) qb.andWhere('jsonb_array_length(r."imageUrls") > 0');
    if (sort === 'best') qb.orderBy('r.rating', 'DESC');
    else qb.orderBy('r.createdAt', 'DESC');

    const total = await qb.getCount();
    const reviews = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data: reviews.map(r => this.toReviewDto(r)), total };
  }

  async updateReview(id: number, userId: number, dto: UpdateReviewDto): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: { deleteRequests: true },
    });
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    if (review.customerId !== userId) throw new ForbiddenException('본인의 리뷰만 수정할 수 있습니다.');

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;

    const saved = await this.reviewRepository.save(review);
    await this.refreshExpertStats(review.expertProfileId);
    return this.toReviewDto(saved);
  }

  async deleteReview(id: number, userId: number): Promise<{ message: string }> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    if (review.customerId !== userId) throw new ForbiddenException('본인의 리뷰만 삭제할 수 있습니다.');

    // 삭제 요청 행이 review를 FK로 참조 — 함께 정리
    await this.reviewRepository.manager.transaction(async manager => {
      await manager.delete(ReviewDeleteRequest, { reviewId: id });
      await manager.delete(Review, { id });
    });
    await this.refreshExpertStats(review.expertProfileId);
    return { message: '리뷰가 삭제되었습니다.' };
  }

  // 명인 프로필의 평점/리뷰 수 캐시 갱신 — 탐색·추천 정렬과 '평점 4+' 필터가 이 값을 사용
  private async refreshExpertStats(expertProfileId: number): Promise<void> {
    const row: { avg: string | null; count: string } | undefined = await this.reviewRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.expertProfileId = :expertProfileId', { expertProfileId })
      .getRawOne();
    const count = Number(row?.count ?? 0);
    const average = count > 0 ? Math.round(Number(row?.avg) * 10) / 10 : 0;
    await this.expertProfileRepository.update(expertProfileId, { averageRating: average, totalReviewCount: count });
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
      expertProfileId: review.expertProfileId,
      expertName: review.expertProfile ? expertDisplayName(review.expertProfile) : undefined,
      expertAvatarUrl: review.expertProfile
        ? (review.expertProfile.profileImageUrl ?? review.expertProfile.portfolioImageUrls?.[0] ?? null)
        : undefined,
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
