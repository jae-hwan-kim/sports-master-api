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
import { FeaturedExpertDto } from '../expert-profiles/dto/featured-expert.dto';
import { CreateReviewTokenDto } from '../reviews/dto/create-review-token.dto';
import { ReviewTokenResponseDto } from '../reviews/dto/review-response.dto';
import { UpdateModeDto } from '../users/dto/update-mode.dto';
import { UpdateModeResponseDto } from '../users/dto/user-response.dto';
import { User, UserMode } from '../users/user.entity';
import { ensureExpertProfile, expertDisplayName } from '../expert-profiles/ensure-expert-profile';

const REVIEW_REQUEST_TOKEN_EXPIRES_IN = '7d';
const FEATURED_EXPERTS_LIMIT = 10;

function toReviewLink(reviewToken: string, shareBaseUrl: string): ReviewTokenResponseDto {
  return {
    reviewToken,
    deepLink: `sportsmaster://review?token=${reviewToken}`,
    shareUrl: `${shareBaseUrl}/r/review?token=${reviewToken}`,
  };
}

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
      name: expertDisplayName(expertProfile),
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
      profileImageUrl: expertProfile.profileImageUrl,
      centerPhone: expertProfile.centerPhone,
      imageUrls: expertProfile.imageUrls ?? [],
      certificateUrls: expertProfile.certificateUrls ?? [],
      centerInfoUrl: expertProfile.centerInfoUrl ?? null,
      createdAt: expertProfile.createdAt,
      topPercentile: null,
      updatedAt: expertProfile.updatedAt,
    };
  }

  // shareBaseUrl: 요청이 들어온 API 주소 (https 중계 페이지 /r/review 가 같은 서버에 있음)
  async createReviewRequestLink(
    userId: number,
    dto: CreateReviewTokenDto,
    shareBaseUrl: string,
  ): Promise<ReviewTokenResponseDto> {
    const expertProfile = await this.getExpertProfileOrThrow(userId);
    const signOptions = {
      secret: requireEnv(this.config, 'JWT_ACCESS_SECRET'),
      expiresIn: REVIEW_REQUEST_TOKEN_EXPIRES_IN as unknown as number,
    };

    // chatRoomId 없음 → 명인 단위 링크 (명인홈 '링크 보내기')
    if (dto.chatRoomId === undefined) {
      const reviewToken = await this.jwtService.signAsync(
        { typ: 'review', expertProfileId: expertProfile.id },
        signOptions,
      );
      return toReviewLink(reviewToken, shareBaseUrl);
    }

    const chatRoom = await this.chatRoomRepository.findOne({ where: { id: dto.chatRoomId } });
    if (!chatRoom || chatRoom.expertProfileId !== expertProfile.id) {
      throw new ForbiddenException('본인의 채팅방이 아닙니다.');
    }

    const reviewToken = await this.jwtService.signAsync({ typ: 'review', chatRoomId: chatRoom.id }, signOptions);

    chatRoom.reviewRequestSentAt = new Date();
    await this.chatRoomRepository.save(chatRoom);

    return toReviewLink(reviewToken, shareBaseUrl);
  }

  // 이달의 소개 명인 — 광고 기능 전까지 광고 활성 명인 우선 + 평점/리뷰순으로 노출
  // 명인 인증 승인 처리 경로가 아직 없어 승인 여부로 거르지 않음 (승인 체계 생기면 다시 추가)
  async getFeaturedExperts(): Promise<FeaturedExpertDto[]> {
    const experts = await this.expertProfileRepository
      .createQueryBuilder('ep')
      .innerJoinAndSelect('ep.user', 'u')
      .where('u.deletedAt IS NULL')
      .andWhere('u.isActive = true')
      // 지역도 입력하지 않은 빈 프로필(가입 직후 자동 생성분)은 노출하지 않음
      .andWhere("ep.region <> ''")
      // 광고 활성 + 미만료 명인 우선
      .orderBy(
        'CASE WHEN "ep"."isAdActive" AND ("ep"."adExpiresAt" IS NULL OR "ep"."adExpiresAt" > NOW()) THEN 0 ELSE 1 END',
        'ASC',
      )
      .addOrderBy('ep.averageRating', 'DESC')
      .addOrderBy('ep.totalReviewCount', 'DESC')
      .addOrderBy('ep.id', 'DESC')
      .limit(FEATURED_EXPERTS_LIMIT)
      .getMany();

    return experts.map(ep => ({
      id: ep.id,
      name: expertDisplayName(ep),
      introduction: ep.introduction,
      region: ep.region,
      keywordTags: ep.keywordTags,
      // 프로필 대표 사진 우선, 없으면 소개 이미지 첫 장
      imageUrl: ep.profileImageUrl ?? ep.portfolioImageUrls?.[0] ?? ep.imageUrls?.[0] ?? null,
      expertGrade: ep.expertGrade,
    }));
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

    const targetMode = dto.mode as unknown as UserMode;
    // 명인 모드 첫 전환 시 빈 명인 프로필 생성 (앱에 별도 프로필 생성 단계가 없음)
    if (targetMode === UserMode.EXPERT) {
      await ensureExpertProfile(this.userRepository.manager, userId);
    }
    user.currentMode = targetMode;
    user.hasSelectedMode = true;
    await this.userRepository.save(user);
    return { currentMode: user.currentMode, hasSelectedMode: user.hasSelectedMode };
  }

  private async getExpertProfileOrThrow(userId: number): Promise<ExpertProfile> {
    const expertProfile = await ensureExpertProfile(this.expertProfileRepository.manager, userId);
    return expertProfile;
  }
}
