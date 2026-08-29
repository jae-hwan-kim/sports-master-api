import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from '../customer-profiles/customer-profile.entity';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { DiagnosisRequest, DiagnosisStatus } from './diagnosis-request.entity';
import { DiagnosisIncomingItemDto } from './dto/diagnosis-response.dto';

@Injectable()
export class DiagnosesService {
  constructor(
    @InjectRepository(DiagnosisRequest)
    private readonly diagnosisRequestRepository: Repository<DiagnosisRequest>,
    @InjectRepository(ExpertProfile)
    private readonly expertProfileRepository: Repository<ExpertProfile>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
  ) {}

  async getIncoming(userId: number): Promise<DiagnosisIncomingItemDto[]> {
    const expertProfile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!expertProfile) {
      throw new NotFoundException('명인 프로필이 존재하지 않습니다.');
    }

    const requests = await this.diagnosisRequestRepository.find({
      where: { expertProfileId: expertProfile.id },
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

  async deleteRequest(userId: number, requestId: number): Promise<void> {
    const expertProfile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!expertProfile) throw new NotFoundException('명인 프로필이 존재하지 않습니다.');

    const request = await this.diagnosisRequestRepository.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('진단요청을 찾을 수 없습니다.');
    if (request.expertProfileId !== expertProfile.id) throw new ForbiddenException('접근 권한이 없습니다.');

    await this.diagnosisRequestRepository.update(requestId, { status: DiagnosisStatus.DELETED });
  }
}
