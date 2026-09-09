import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { requireEnv } from '../../common/config/require-env';
import { ChatRoom } from '../chat-rooms/chat-room.entity';
import { DiagnosisRequest, DiagnosisStatus } from '../diagnoses/diagnosis-request.entity';
import { DiagnosisIncomingItemDto } from '../diagnoses/dto/diagnosis-response.dto';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { ExpertProfileResponseDto } from '../expert-profiles/dto/expert-profile-response.dto';
import { CreateReviewTokenDto } from '../reviews/dto/create-review-token.dto';
import { ReviewTokenResponseDto } from '../reviews/dto/review-response.dto';
import { UpdateModeDto } from '../users/dto/update-mode.dto';
import { UpdateModeResponseDto } from '../users/dto/user-response.dto';
import { User, UserMode } from '../users/user.entity';

const REVIEW_REQUEST_TOKEN_EXPIRES_IN = '7d';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ExpertProfile) private readonly expertProfileRepository: Repository<ExpertProfile>,
    @InjectRepository(DiagnosisRequest) private readonly diagnosisRequestRepository: Repository<DiagnosisRequest>,
    @InjectRepository(ChatRoom) private readonly chatRoomRepository: Repository<ChatRoom>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async getExpertGrade(userId: number): Promise<ExpertProfileResponseDto> {
    const expertProfile = await this.getExpertProfileOrThrow(userId);
    return {
      id: expertProfile.id,
      userId: expertProfile.userId,
      region: expertProfile.region,
      centerName: expertProfile.centerName,
      representativeService: expertProfile.representativeService,
      introduction: expertProfile.introduction,
      kakaoOpenChatUrl: expertProfile.kakaoOpenChatUrl,
      expertGrade: expertProfile.expertGrade,
      totalReviewCount: expertProfile.totalReviewCount,
      averageRating: expertProfile.averageRating,
      certificationStatus: expertProfile.certificationStatus,
      portfolioImageUrls: expertProfile.portfolioImageUrls,
      keywordTags: expertProfile.keywordTags,
      careerText: expertProfile.careerText,
      educationPdfUrl: expertProfile.educationPdfUrl,
      imageUrls: expertProfile.imageUrls ?? [],
      certificateUrls: expertProfile.certificateUrls ?? [],
      centerInfoUrl: expertProfile.centerInfoUrl ?? null,
      createdAt: expertProfile.createdAt,
      topPercentile: null,
      updatedAt: expertProfile.updatedAt,
    };
  }

  async createReviewRequestLink(userId: number, dto: CreateReviewTokenDto): Promise<ReviewTokenResponseDto> {
    const expertProfile = await this.getExpertProfileOrThrow(userId);
    const chatRoom = await this.chatRoomRepository.findOne({ where: { id: dto.chatRoomId } });
    if (!chatRoom || chatRoom.expertProfileId !== expertProfile.id) {
      throw new ForbiddenException('본인의 채팅방이 아닙니다.');
    }

    const reviewToken = await this.jwtService.signAsync(
      { chatRoomId: chatRoom.id },
      {
        secret: requireEnv(this.config, 'JWT_ACCESS_SECRET'),
        expiresIn: REVIEW_REQUEST_TOKEN_EXPIRES_IN as unknown as number,
      },
    );

    chatRoom.reviewRequestSentAt = new Date();
    await this.chatRoomRepository.save(chatRoom);

    return { reviewToken, deepLink: `sportsmaster://review?token=${reviewToken}` };
  }

  async getDiagnosisPreview(userId: number): Promise<DiagnosisIncomingItemDto[]> {
    const expertProfile = await this.getExpertProfileOrThrow(userId);
    const requests = await this.diagnosisRequestRepository.find({
      where: { expertProfileId: expertProfile.id, status: DiagnosisStatus.PENDING },
      order: { createdAt: 'ASC' },
      take: 3,
    });

    return requests.map(r => ({
      id: r.id,
      status: r.status,
      isViewed: r.isViewed,
      customerProfile: {
        personalCode: r.customerPersonalCode,
        nickname: null,
        profileImageUrl: null,
        name: r.customerName,
        age: r.customerAge,
        gender: r.customerGender,
        region: r.customerRegion ?? null,
        sport: r.mainSport,
        keywordTags: null,
        introduction: null,
      },
      createdAt: r.createdAt,
    }));
  }

  async switchMode(userId: number, dto: UpdateModeDto): Promise<UpdateModeResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // ExpertProfile 생성 경로가 아직 없어(자격증 인증 체계 별도 작업 예정) register()와 동일하게
    // 관대히 허용한다 — 명인 프로필 존재 검증은 그 체계가 생기면 다시 추가한다.
    const targetMode = dto.mode as unknown as UserMode;
    user.currentMode = targetMode;
    user.hasSelectedMode = true;
    await this.userRepository.save(user);
    return { currentMode: user.currentMode, hasSelectedMode: user.hasSelectedMode };
  }

  private async getExpertProfileOrThrow(userId: number): Promise<ExpertProfile> {
    const expertProfile = await this.expertProfileRepository.findOne({ where: { userId } });
    if (!expertProfile) {
      throw new NotFoundException('명인 프로필이 존재하지 않습니다.');
    }
    return expertProfile;
  }
}
