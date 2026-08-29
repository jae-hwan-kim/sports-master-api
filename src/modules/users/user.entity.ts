import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { CustomerProfile } from '../customer-profiles/customer-profile.entity';
import { Review } from '../reviews/review.entity';
import { FavoriteExpert } from '../favorite-experts/favorite-expert.entity';
import { Schedule } from '../schedules/schedule.entity';
import { DiagnosisRequest } from '../diagnoses/diagnosis-request.entity';

export enum AuthProvider {
  LOCAL = 'local',
  KAKAO = 'kakao',
  APPLE = 'apple',
  GOOGLE = 'google',
}

export enum UserMode {
  EXPERT = 'expert',
  CUSTOMER = 'customer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  personalCode: string;

  @Column({ unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  password: string | null;

  @Column({ nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'enum', enum: AuthProvider })
  authProvider: AuthProvider;

  @Column({ unique: true, nullable: true })
  socialId: string | null;

  @Column({ type: 'enum', enum: UserMode })
  currentMode: UserMode;

  @Column({ nullable: true })
  profileImageUrl: string | null;

  @Column({ unique: true, nullable: true })
  nickname: string | null;

  @Column({ default: true })
  isActive: boolean;

  // 모드(명인/고객)를 실제로 확정했는지 — register()는 항상 명시적 mode와 함께 true로 생성되고,
  // 소셜 로그인으로 생성된 계정은 모드선택 전까지 false로 남아있어 재진입 시 모드선택 화면으로
  // 다시 보내야 하는지 판단하는 데 쓰인다.
  @Column({ default: false })
  hasSelectedMode: boolean;

  // 자격증 이미지 업로드 여부 — 추후 "검증된 명인" 뱃지 등에 사용 예정.
  // ExpertProfile이 아직 생성 불가능한 상태라 이번 단계에서는 실제로 true로 갱신하는 로직은 없음.
  @Column({ default: false })
  hasSubmittedCertification: boolean;

  @Column({ type: 'timestamp', nullable: true, default: null })
  lastReviewStatShownAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToOne(() => ExpertProfile, ep => ep.user)
  expertProfile: ExpertProfile;

  @OneToOne(() => CustomerProfile, cp => cp.user)
  customerProfile: CustomerProfile;

  @OneToMany(() => Review, r => r.customer)
  reviews: Review[];

  @OneToMany(() => FavoriteExpert, fe => fe.customer)
  favoriteExperts: FavoriteExpert[];

  @OneToMany(() => Schedule, s => s.user)
  schedules: Schedule[];

  @OneToMany(() => DiagnosisRequest, dr => dr.customer)
  diagnosisRequests: DiagnosisRequest[];
}
