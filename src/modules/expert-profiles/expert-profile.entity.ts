import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Certification } from '../certifications/certification.entity';
import { Review } from '../reviews/review.entity';
import { DiagnosisRequest } from '../diagnoses/diagnosis-request.entity';
import { ChatRoom } from '../chat-rooms/chat-room.entity';
import { FavoriteExpert } from '../favorite-experts/favorite-expert.entity';
import { AdCampaign } from '../ad-campaigns/ad-campaign.entity';

export enum ExpertGrade {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum CertificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('expert_profiles')
export class ExpertProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column()
  region: string;

  @Column()
  centerName: string;

  @Column()
  representativeService: string;

  @Column({ nullable: true, type: 'text' })
  introduction: string | null;

  @Column({ nullable: true })
  kakaoOpenChatUrl: string | null;

  @Column({ nullable: true })
  externalSiteUrl: string | null;

  @Column({ type: 'enum', enum: ExpertGrade, nullable: true })
  expertGrade: ExpertGrade | null;

  @Column({ type: 'int', default: 0 })
  totalReviewCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0.0 })
  averageRating: number;

  @Column({ type: 'enum', enum: CertificationStatus, default: CertificationStatus.PENDING })
  certificationStatus: CertificationStatus;

  @Column({ type: 'simple-array', nullable: true })
  portfolioImageUrls: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  keywordTags: string[] | null;

  @Column({ type: 'text', nullable: true })
  careerText: string | null;

  @Column({ nullable: true })
  educationPdfUrl: string | null;

  @Column({ type: 'jsonb', default: [] })
  imageUrls: string[];

  @Column({ type: 'jsonb', default: [] })
  certificateUrls: string[];

  @Column({ nullable: true })
  centerInfoUrl: string | null;

  @Column({ default: false })
  isAdActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  adExpiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, u => u.expertProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Certification, c => c.expertProfile)
  certifications: Certification[];

  @OneToMany(() => Review, r => r.expertProfile)
  reviews: Review[];

  @OneToMany(() => DiagnosisRequest, dr => dr.expertProfile)
  diagnosisRequests: DiagnosisRequest[];

  @OneToMany(() => ChatRoom, cr => cr.expertProfile)
  chatRooms: ChatRoom[];

  @OneToMany(() => FavoriteExpert, fe => fe.expertProfile)
  favoritedBy: FavoriteExpert[];

  @OneToMany(() => AdCampaign, ac => ac.expertProfile)
  adCampaigns: AdCampaign[];
}
