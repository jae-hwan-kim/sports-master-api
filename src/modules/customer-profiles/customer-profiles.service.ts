import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from './customer-profile.entity';
import { CustomerProfileResponseDto } from './dto/customer-profile-response.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

const REGIONS = [
  '서울', '경기', '인천', '강원', '충북', '충남',
  '대전', '세종', '전북', '전남', '광주', '경북',
  '경남', '대구', '울산', '부산', '제주',
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
    const profile = await this.repo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('고객 프로필이 없습니다.');
    return this.toDto(profile);
  }

  async updateMe(userId: number, dto: UpdateCustomerProfileDto): Promise<CustomerProfileResponseDto> {
    let profile = await this.repo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.repo.create({ userId, region: dto.region ?? '' });
    }
    if (dto.nickname !== undefined) profile.region = profile.region; // nickname은 entity에 없음 — User 테이블에 있음
    if (dto.gender !== undefined) profile.gender = dto.gender;
    if (dto.ageGroup !== undefined) profile.ageGroup = dto.ageGroup;
    if (dto.age !== undefined) profile.age = dto.age;
    if (dto.region !== undefined) profile.region = dto.region;
    if (dto.symptoms !== undefined) profile.symptoms = dto.symptoms;
    if (dto.keywords !== undefined) profile.keywordTags = dto.keywords;
    const saved = await this.repo.save(profile);
    return this.toDto(saved);
  }

  private toDto(p: CustomerProfile): CustomerProfileResponseDto {
    return {
      id: p.id,
      userId: p.userId,
      nickname: '',
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
