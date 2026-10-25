import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../../common/storage/storage.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { Certification, CertificationReviewStatus, CertificationType } from './certification.entity';
import { CertificationResponseDto } from './dto/certification-response.dto';
import {
  CreateCertificationDto,
  CertificationType as CreateCertificationType,
  LicenseType,
} from './dto/create-certification.dto';
import { UpdateCertificationStatusDto } from './dto/update-certification-status.dto';
import { ensureExpertProfile } from '../expert-profiles/ensure-expert-profile';

@Injectable()
export class CertificationsService {
  constructor(
    @InjectRepository(Certification) private readonly certificationRepository: Repository<Certification>,
    @InjectRepository(ExpertProfile) private readonly expertProfileRepository: Repository<ExpertProfile>,
    private readonly storage: StorageService,
  ) {}

  async create(
    userId: number,
    dto: CreateCertificationDto,
    file: Express.Multer.File,
  ): Promise<CertificationResponseDto> {
    if (!file) {
      throw new BadRequestException('첨부 파일이 필요합니다.');
    }
    const expertProfile = await ensureExpertProfile(this.expertProfileRepository.manager, userId);

    const fileUrl = await this.storage.upload(file, `certifications/${userId}`);
    const certification = await this.certificationRepository.save(
      this.certificationRepository.create({
        expertProfileId: expertProfile.id,
        type: this.mapCertificationType(dto),
        fileUrl,
        status: CertificationReviewStatus.PENDING,
      }),
    );

    return this.toResponseDto(certification);
  }

  async findMine(userId: number): Promise<CertificationResponseDto[]> {
    const expertProfile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!expertProfile) {
      return [];
    }
    const certifications = await this.certificationRepository.find({ where: { expertProfileId: expertProfile.id } });
    return certifications.map(c => this.toResponseDto(c));
  }

  async findAll(): Promise<CertificationResponseDto[]> {
    const certifications = await this.certificationRepository.find();
    return certifications.map(c => this.toResponseDto(c));
  }

  async updateStatus(id: number, dto: UpdateCertificationStatusDto): Promise<CertificationResponseDto> {
    const certification = await this.certificationRepository.findOne({ where: { id } });
    if (!certification) {
      throw new NotFoundException('자격증 검수 요청을 찾을 수 없습니다.');
    }

    certification.status =
      dto.status === 'approved' ? CertificationReviewStatus.APPROVED : CertificationReviewStatus.REJECTED;
    certification.adminComment = dto.rejectReason ?? null;
    const updated = await this.certificationRepository.save(certification);
    return this.toResponseDto(updated);
  }

  private mapCertificationType(dto: CreateCertificationDto): CertificationType {
    if (dto.type === CreateCertificationType.GRADUATION) {
      return CertificationType.GRADUATION_CERTIFICATE;
    }
    if (dto.licenseType === LicenseType.PT) {
      return CertificationType.PHYSICAL_THERAPIST;
    }
    if (dto.licenseType === LicenseType.HEALTH_EXERCISE) {
      return CertificationType.HEALTH_EXERCISE_MANAGER;
    }
    return CertificationType.OTHER;
  }

  private toResponseDto(certification: Certification): CertificationResponseDto {
    return {
      id: certification.id,
      type: certification.type,
      status: certification.status,
      fileUrls: [certification.fileUrl],
      reviewedAt: certification.status === CertificationReviewStatus.PENDING ? null : certification.updatedAt,
    };
  }
}
