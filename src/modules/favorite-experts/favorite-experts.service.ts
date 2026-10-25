import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { FavoriteExpertItemDto } from './dto/favorite-expert-response.dto';
import { FavoriteStatusDto } from './dto/favorite-status.dto';
import { FavoriteExpert } from './favorite-expert.entity';
import { expertDisplayName } from '../expert-profiles/ensure-expert-profile';

@Injectable()
export class FavoriteExpertsService {
  constructor(
    @InjectRepository(FavoriteExpert)
    private readonly favoriteExpertRepository: Repository<FavoriteExpert>,
    @InjectRepository(ExpertProfile)
    private readonly expertProfileRepository: Repository<ExpertProfile>,
  ) {}

  async toggle(userId: number, expertProfileId: number): Promise<FavoriteStatusDto> {
    const expert = await this.expertProfileRepository.findOne({ where: { id: expertProfileId } });
    if (!expert) throw new NotFoundException('명인 프로필이 없습니다.');

    const existing = await this.favoriteExpertRepository.findOne({
      where: { customerId: userId, expertProfileId },
    });

    if (existing) {
      await this.favoriteExpertRepository.delete(existing.id);
      return { isFavorited: false, favoriteId: null };
    }

    const saved = await this.favoriteExpertRepository.save(
      this.favoriteExpertRepository.create({ customerId: userId, expertProfileId }),
    );
    return { isFavorited: true, favoriteId: saved.id };
  }

  async remove(userId: number, expertProfileId: number): Promise<void> {
    const existing = await this.favoriteExpertRepository.findOne({
      where: { customerId: userId, expertProfileId },
    });
    if (!existing) throw new NotFoundException('찜 내역이 없습니다.');
    await this.favoriteExpertRepository.delete(existing.id);
  }

  async getStatus(userId: number, expertProfileId: number): Promise<FavoriteStatusDto> {
    const existing = await this.favoriteExpertRepository.findOne({
      where: { customerId: userId, expertProfileId },
    });
    return {
      isFavorited: !!existing,
      favoriteId: existing?.id ?? null,
    };
  }

  async getMyFavorites(userId: number): Promise<FavoriteExpertItemDto[]> {
    const favorites = await this.favoriteExpertRepository.find({
      where: { customerId: userId },
      relations: { expertProfile: { user: true } },
      order: { createdAt: 'DESC' },
    });

    return favorites.map(f => ({
      id: f.expertProfile.id,
      name: expertDisplayName(f.expertProfile),
      grade: f.expertProfile.expertGrade,
      reviewCount: f.expertProfile.totalReviewCount,
      // PG decimal은 문자열로 옴 — 앱에서 toFixed 호출하므로 숫자로 변환
      avgRating: Number(f.expertProfile.averageRating),
      avatarUrl: f.expertProfile.portfolioImageUrls?.[0] ?? f.expertProfile.imageUrls?.[0] ?? null,
    }));
  }
}
