import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../../common/storage/storage.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpertProfileDto } from './dto/create-expert-profile.dto';
import { ExpertListItemDto } from './dto/expert-list-item.dto';
import { ExpertProfileResponseDto, UploadedFilesResponseDto } from './dto/expert-profile-response.dto';
import { UpdateExpertProfileDto } from './dto/update-expert-profile.dto';
import { ExpertProfile } from './expert-profile.entity';
import { ensureExpertProfile } from './ensure-expert-profile';
import { expertDisplayName } from './ensure-expert-profile';

// 페이지네이션 도입 전 상한
const EXPERT_LIST_LIMIT = 100;

@Injectable()
export class ExpertProfilesService {
  constructor(
    @InjectRepository(ExpertProfile) private readonly expertProfileRepository: Repository<ExpertProfile>,
    private readonly storage: StorageService,
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
      keywordTags: dto.keywordTags ?? null,
    });
    const saved = await this.expertProfileRepository.save(profile);
    return this.toDto(saved);
  }

  async getMe(userId: number): Promise<ExpertProfileResponseDto> {
    const profile = await ensureExpertProfile(this.expertProfileRepository.manager, userId);
    return this.toDto(profile);
  }

  async getById(id: number): Promise<ExpertProfileResponseDto> {
    const profile = await this.expertProfileRepository.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('명인 프로필이 없습니다.');
    return this.toDto(profile);
  }

  // 명인탐색 — 활성 회원의 명인 전체, 검색어/지역/최소 평점은 주어진 것만 적용
  async list(filter: { q?: string; region?: string; minRating?: number }): Promise<ExpertListItemDto[]> {
    const qb = this.expertProfileRepository
      .createQueryBuilder('ep')
      .innerJoinAndSelect('ep.user', 'u')
      .where('u.deletedAt IS NULL')
      .andWhere('u.isActive = true')
      // 지역도 입력하지 않은 빈 프로필(가입 직후 자동 생성분)은 노출하지 않음
      .andWhere("ep.region <> ''");

    const q = filter.q?.trim();
    if (q) {
      qb.andWhere('(ep.centerName ILIKE :q OR ep.representativeService ILIKE :q OR u.nickname ILIKE :q)', {
        q: `%${q}%`,
      });
    }
    const region = filter.region?.trim();
    if (region && region !== '전국') {
      // 명인 region 형식: "서울 > 강남구, 경기" (RegionSelector) — 구 단위 검색 시 해당 시/도 전체를 고른 명인도 포함
      const [province, district] = region.split('>').map(part => part.trim());
      if (district) {
        qb.andWhere('(ep.region ILIKE :region OR ep.region ~ :provinceOnly)', {
          region: `%${province} > ${district}%`,
          provinceOnly: `(^|, )${province}(,|$)`,
        });
      } else {
        qb.andWhere('ep.region ILIKE :region', { region: `%${region}%` });
      }
    }
    if (filter.minRating !== undefined) {
      qb.andWhere('ep.averageRating >= :minRating', { minRating: filter.minRating });
    }

    const experts = await qb
      .orderBy('ep.averageRating', 'DESC')
      .addOrderBy('ep.totalReviewCount', 'DESC')
      .addOrderBy('ep.id', 'DESC')
      .limit(EXPERT_LIST_LIMIT)
      .getMany();

    return experts.map(ep => ({
      id: ep.id,
      name: expertDisplayName(ep),
      region: ep.region,
      representativeService: ep.representativeService,
      keywordTags: ep.keywordTags,
      imageUrl: ep.profileImageUrl ?? ep.portfolioImageUrls?.[0] ?? ep.imageUrls?.[0] ?? null,
      averageRating: Number(ep.averageRating),
      totalReviewCount: ep.totalReviewCount,
    }));
  }

  async updateMe(userId: number, dto: UpdateExpertProfileDto): Promise<ExpertProfileResponseDto> {
    const profile = await ensureExpertProfile(this.expertProfileRepository.manager, userId);

    if (dto.region !== undefined) profile.region = dto.region;
    if (dto.centerName !== undefined) profile.centerName = dto.centerName;
    if (dto.representativeService !== undefined) profile.representativeService = dto.representativeService;
    if (dto.bio !== undefined) profile.introduction = dto.bio;
    if (dto.careerText !== undefined) profile.careerText = dto.careerText;
    if (dto.keywordTags !== undefined) profile.keywordTags = dto.keywordTags;
    if (dto.openChatUrl !== undefined) profile.kakaoOpenChatUrl = dto.openChatUrl;
    if (dto.centerPhone !== undefined) profile.centerPhone = dto.centerPhone || null;

    // 파일 필드: 우리 저장소 URL만 허용, 빠진 파일은 저장 후 R2에서 정리
    const removedFiles: string[] = [];
    if (dto.portfolioImageUrls !== undefined) {
      this.assertOwnUrls(dto.portfolioImageUrls);
      const next = dto.portfolioImageUrls;
      removedFiles.push(...(profile.portfolioImageUrls ?? []).filter(url => !next.includes(url)));
      profile.portfolioImageUrls = next.length > 0 ? next : null;
    }
    if (dto.profileImageUrl !== undefined) {
      const next = dto.profileImageUrl || null;
      if (next) this.assertOwnUrls([next]);
      if (profile.profileImageUrl && profile.profileImageUrl !== next) removedFiles.push(profile.profileImageUrl);
      profile.profileImageUrl = next;
    }
    if (dto.educationPdfUrl !== undefined) {
      const next = dto.educationPdfUrl || null;
      if (next) this.assertOwnUrls([next]);
      if (profile.educationPdfUrl && profile.educationPdfUrl !== next) removedFiles.push(profile.educationPdfUrl);
      profile.educationPdfUrl = next;
    }

    const saved = await this.expertProfileRepository.save(profile);
    await Promise.all(removedFiles.map(url => this.storage.deleteByUrl(url)));
    return this.toDto(saved);
  }

  // 파일만 R2에 올리고 URL 반환 — 프로필 반영은 PATCH me (순서·삭제를 한 번에 확정하기 위함)
  async uploadFiles(
    userId: number,
    kind: 'image' | 'pdf',
    files: Express.Multer.File[],
  ): Promise<UploadedFilesResponseDto> {
    if (!files?.length) throw new BadRequestException('업로드할 파일이 없습니다.');
    const folder = `experts/${userId}/${kind === 'image' ? 'images' : 'pdf'}`;
    const urls = await Promise.all(files.map(file => this.storage.upload(file, folder)));
    return { urls };
  }

  private assertOwnUrls(urls: string[]): void {
    if (urls.some(url => !this.storage.isOwnUrl(url))) {
      throw new BadRequestException('업로드 API로 올린 파일만 저장할 수 있습니다.');
    }
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
      profileImageUrl: profile.profileImageUrl,
      centerPhone: profile.centerPhone,
      imageUrls: profile.imageUrls ?? [],
      certificateUrls: profile.certificateUrls ?? [],
      centerInfoUrl: profile.centerInfoUrl,
      topPercentile,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
