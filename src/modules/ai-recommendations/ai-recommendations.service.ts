import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { CustomerProfile } from '../customer-profiles/customer-profile.entity';
import { AiRecommendationResponseDto, RecommendedExpertDto } from './dto/ai-recommendation-response.dto';
import { expertDisplayName } from '../expert-profiles/ensure-expert-profile';

@Injectable()
export class AiRecommendationsService {
  constructor(
    @InjectRepository(ExpertProfile)
    private readonly expertRepo: Repository<ExpertProfile>,
    @InjectRepository(CustomerProfile)
    private readonly customerRepo: Repository<CustomerProfile>,
  ) {}

  async getRecommendedMasters(userId: number): Promise<AiRecommendationResponseDto> {
    const customer = await this.customerRepo.findOne({ where: { userId } });

    const qb = this.expertRepo
      .createQueryBuilder('ep')
      .innerJoinAndSelect('ep.user', 'u')
      .where('u.deletedAt IS NULL')
      .andWhere('u.isActive = true')
      // 지역도 입력하지 않은 빈 프로필(가입 직후 자동 생성분)은 노출하지 않음
      .andWhere("ep.region <> ''")
      .limit(3);

    if (customer?.region) {
      // 지역이 일치하는 명인 우선 — 완전 일치가 없으면 전체에서 추출
      qb.orderBy(`CASE WHEN ep.region ILIKE :region THEN 0 ELSE 1 END`, 'ASC').setParameter(
        'region',
        `%${customer.region.split(',')[0].trim()}%`,
      );
    }

    qb.addOrderBy('ep.averageRating', 'DESC');

    const experts = await qb.getMany();

    const recommendedExperts: RecommendedExpertDto[] = experts.map(ep => ({
      id: ep.id,
      name: expertDisplayName(ep),
      region: ep.region,
      representativeService: ep.representativeService,
      expertGrade: ep.expertGrade,
      averageRating: Number(ep.averageRating),
      totalReviewCount: ep.totalReviewCount,
      avatarUrl: ep.portfolioImageUrls?.[0] ?? ep.imageUrls?.[0] ?? null,
      keywordTags: ep.keywordTags,
    }));

    const regionLabel = customer?.region ? customer.region.split(',')[0].trim() : '가까운';
    const keywordLabel = customer?.keywordTags?.slice(0, 2).join(', ') ?? '스포츠';
    const aiSummary = `${regionLabel} 지역에서 ${keywordLabel} 전문 명인을 추천해드립니다.`;

    return { aiSummary, recommendedExperts };
  }
}
