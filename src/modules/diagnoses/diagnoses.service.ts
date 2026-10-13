import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CustomerProfile } from '../customer-profiles/customer-profile.entity';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { User } from '../users/user.entity';
import { CreateDiagnosisRequestDto } from './dto/create-diagnosis-request.dto';
import { DiagnosisRequestResponseDto, DiagnosisIncomingItemDto } from './dto/diagnosis-response.dto';
import { DiagnosisGender, DiagnosisRequest, DiagnosisStatus } from './diagnosis-request.entity';

@Injectable()
export class DiagnosesService {
  constructor(
    @InjectRepository(DiagnosisRequest)
    private readonly diagnosisRequestRepository: Repository<DiagnosisRequest>,
    @InjectRepository(ExpertProfile)
    private readonly expertProfileRepository: Repository<ExpertProfile>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createRequest(userId: number, dto: CreateDiagnosisRequestDto): Promise<DiagnosisRequestResponseDto> {
    const expert = await this.expertProfileRepository.findOne({ where: { id: dto.expertProfileId } });
    if (!expert) throw new NotFoundException('명인 프로필이 없습니다.');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const pendingExists = await this.diagnosisRequestRepository.findOne({
      where: { customerId: userId, expertProfileId: dto.expertProfileId, status: DiagnosisStatus.PENDING },
    });
    if (pendingExists) throw new ConflictException('이미 접수된 진단 요청이 있습니다.');

    const cp = await this.customerProfileRepository.findOne({ where: { userId } });

    const request = new DiagnosisRequest();
    request.customerId = userId;
    request.expertProfileId = dto.expertProfileId;
    request.customerPersonalCode = user.personalCode;
    request.customerName = user.nickname ?? user.personalCode;
    request.customerAge = cp?.age ?? null;
    request.customerGender = (cp?.gender ?? null) as unknown as DiagnosisGender | null;
    request.customerRegion = cp?.region ?? null;
    request.mainSport = cp?.mainSport ?? null;
    const saved = await this.diagnosisRequestRepository.save(request);

    return {
      id: saved.id,
      expertId: dto.expertProfileId,
      customerId: userId,
      status: saved.status,
      createdAt: saved.createdAt,
    };
  }

  async getIncoming(userId: number): Promise<DiagnosisIncomingItemDto[]> {
    const expertProfile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!expertProfile) {
      throw new NotFoundException('명인 프로필이 존재하지 않습니다.');
    }

    const requests = await this.diagnosisRequestRepository.find({
      where: { expertProfileId: expertProfile.id, status: Not(DiagnosisStatus.DELETED) },
      relations: { customer: true },
      order: { createdAt: 'ASC' },
    });

    const customerIds = requests.map(r => r.customerId);
    const profiles =
      customerIds.length > 0
        ? await this.customerProfileRepository
            .createQueryBuilder('cp')
            .where('cp.userId IN (:...ids)', { ids: customerIds })
            .getMany()
        : [];

    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    return requests.map(r => {
      const cp = profileMap.get(r.customerId) ?? null;
      return {
        id: r.id,
        status: r.status,
        isViewed: r.isViewed,
        customerProfile: {
          personalCode: r.customerPersonalCode,
          nickname: r.customer?.nickname ?? null,
          profileImageUrl: r.customer?.profileImageUrl ?? null,
          name: r.customerName,
          age: r.customerAge,
          gender: r.customerGender,
          region: r.customerRegion,
          sport: r.mainSport,
          keywordTags: cp?.keywordTags ?? null,
          introduction: null,
        },
        createdAt: r.createdAt,
      };
    });
  }

  async markAsViewed(userId: number, requestId: number): Promise<void> {
    const expertProfile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!expertProfile) throw new NotFoundException('명인 프로필이 존재하지 않습니다.');

    const request = await this.diagnosisRequestRepository.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('진단요청을 찾을 수 없습니다.');
    if (request.expertProfileId !== expertProfile.id) throw new ForbiddenException('접근 권한이 없습니다.');

    if (!request.isViewed) {
      await this.diagnosisRequestRepository.update(requestId, { isViewed: true });
    }
  }

  async deleteRequest(userId: number, requestId: number): Promise<void> {
    const expertProfile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!expertProfile) throw new NotFoundException('명인 프로필이 존재하지 않습니다.');

    const request = await this.diagnosisRequestRepository.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('진단요청을 찾을 수 없습니다.');
    if (request.expertProfileId !== expertProfile.id) throw new ForbiddenException('접근 권한이 없습니다.');

    await this.diagnosisRequestRepository.update(requestId, { status: DiagnosisStatus.DELETED });
  }
}
