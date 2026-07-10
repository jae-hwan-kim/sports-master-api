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

  @Column({ nullable: true })
  nickname: string | null;

  @Column({ default: true })
  isActive: boolean;

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
