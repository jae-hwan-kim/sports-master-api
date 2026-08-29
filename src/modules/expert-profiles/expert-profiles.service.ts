import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpertProfileDto } from './dto/create-expert-profile.dto';
import { ExpertProfileResponseDto } from './dto/expert-profile-response.dto';
import { UpdateExpertProfileDto } from './dto/update-expert-profile.dto';
import { ExpertProfile } from './expert-profile.entity';

@Injectable()
export class ExpertProfilesService {
  constructor(
    @InjectRepository(ExpertProfile) private readonly expertProfileRepository: Repository<ExpertProfile>,
  ) {}

  async create(userId: number, dto: CreateExpertProfileDto): Promise<ExpertProfileResponseDto> {
    const existing = await this.expertProfileRepository.findOne({ where: { userId } });
    if (existing) throw new ConflictException('이미 명인 프로필이 존재합니다.');

    const profile = this.expertProfileRepository.create({
      userId,
      region: dto.region,
      centerName: dto.centerName,
      representativeService: dto.representativeService,
      introduction: dto.bio ?? null,
    });
    const saved = await this.expertProfileRepository.save(profile);
    return this.toDto(saved);
  }

  async getMe(userId: number): Promise<ExpertProfileResponseDto> {
    const profile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('명인 프로필이 없습니다.');
    return this.toDto(profile);
  }

  async updateMe(userId: number, dto: UpdateExpertProfileDto): Promise<ExpertProfileResponseDto> {
    const profile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('명인 프로필이 없습니다.');

    if (dto.region !== undefined) profile.region = dto.region;
    if (dto.centerName !== undefined) profile.centerName = dto.centerName;
    if (dto.representativeService !== undefined) profile.representativeService = dto.representativeService;
    if (dto.bio !== undefined) profile.introduction = dto.bio;
    if (dto.keywordTags !== undefined) profile.keywordTags = dto.keywordTags;
    if (dto.openChatUrl !== undefined) profile.kakaoOpenChatUrl = dto.openChatUrl;

    const saved = await this.expertProfileRepository.save(profile);
    return this.toDto(saved);
  }

  private async calcTopPercentile(profileId: number, totalReviewCount: number): Promise<number | null> {
    const total = await this.expertProfileRepository.count();
    if (total < 2) return null;
    const rank = await this.expertProfileRepository
      .createQueryBuilder('ep')
      .where('ep.totalReviewCount > :count', { count: totalReviewCount })
      .getCount();
    return Math.round(((rank + 1) / total) * 100);
  }

  private async toDto(profile: ExpertProfile): Promise<ExpertProfileResponseDto> {
    const topPercentile = await this.calcTopPercentile(profile.id, profile.totalReviewCount);
    return {
      id: profile.id,
      userId: profile.userId,
      region: profile.region,
      centerName: profile.centerName,
      representativeService: profile.representativeService,
      introduction: profile.introduction,
      kakaoOpenChatUrl: profile.kakaoOpenChatUrl,
      expertGrade: profile.expertGrade,
      totalReviewCount: profile.totalReviewCount,
      averageRating: Number(profile.averageRating),
      certificationStatus: profile.certificationStatus,
      portfolioImageUrls: profile.portfolioImageUrls,
      keywordTags: profile.keywordTags,
      careerText: profile.careerText,
      educationPdfUrl: profile.educationPdfUrl,
      topPercentile,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
