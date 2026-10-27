import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CustomerProfile } from './customer-profile.entity';
import { CustomerProfileResponseDto } from './dto/customer-profile-response.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

const REGIONS = [
  '서울',
  '경기',
  '인천',
  '강원',
  '충북',
  '충남',
  '대전',
  '세종',
  '전북',
  '전남',
  '광주',
  '경북',
  '경남',
  '대구',
  '울산',
  '부산',
  '제주',
];

@Injectable()
export class CustomerProfilesService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly repo: Repository<CustomerProfile>,
  ) {}

  getRegions(): string[] {
    return REGIONS;
  }

  async getMe(userId: number): Promise<CustomerProfileResponseDto> {
    // 설문을 건너뛰었거나 명인 → 고객 전환한 사용자는 프로필 행이 없음 — 빈 프로필을 만들어 마이페이지가 열리게 한다
    const profile = (await this.findWithUser(userId)) ?? (await this.createEmpty(userId));
    return this.toDto(profile);
  }

  async updateMe(userId: number, dto: UpdateCustomerProfileDto): Promise<CustomerProfileResponseDto> {
    const profile = (await this.findWithUser(userId)) ?? (await this.createEmpty(userId));
    // nickname은 User 테이블 컬럼
    if (dto.nickname !== undefined) {
      await this.repo.manager.update(User, userId, { nickname: dto.nickname });
      profile.user.nickname = dto.nickname;
    }
    if (dto.gender !== undefined) profile.gender = dto.gender;
    if (dto.ageGroup !== undefined) profile.ageGroup = dto.ageGroup;
    if (dto.age !== undefined) profile.age = dto.age;
    if (dto.region !== undefined) profile.region = dto.region;
    if (dto.symptoms !== undefined) profile.symptoms = dto.symptoms;
    if (dto.sports !== undefined) profile.mainSport = dto.sports[0] ?? null;
    if (dto.keywords !== undefined) profile.keywordTags = dto.keywords;
    const saved = await this.repo.save(profile);
    return this.toDto(saved);
  }

  private findWithUser(userId: number): Promise<CustomerProfile | null> {
    return this.repo.findOne({ where: { userId }, relations: { user: true } });
  }

  private async createEmpty(userId: number): Promise<CustomerProfile> {
    // 동시 요청으로 두 번 들어와도 userId unique 충돌 없이 한 행만 생성
    await this.repo.createQueryBuilder().insert().values({ userId, region: '' }).orIgnore().execute();
    const profile = await this.findWithUser(userId);
    if (!profile) throw new NotFoundException('고객 프로필을 만들 수 없습니다.');
    return profile;
  }

  private toDto(p: CustomerProfile): CustomerProfileResponseDto {
    return {
      id: p.id,
      userId: p.userId,
      nickname: p.user?.nickname ?? '',
      name: p.user?.name ?? null,
      age: p.age,
      gender: p.gender,
      ageGroup: p.ageGroup,
      region: p.region,
      mainSport: p.mainSport,
      symptoms: p.symptoms,
      keywordTags: p.keywordTags,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
