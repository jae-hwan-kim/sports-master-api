import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';

export enum CertificationType {
  PHYSICAL_THERAPIST = 'physical_therapist',
  HEALTH_EXERCISE_MANAGER = 'health_exercise_manager',
  GRADUATION_CERTIFICATE = 'graduation_certificate',
  OTHER = 'other',
}

export enum CertificationReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  expertProfileId: number;

  @Column({ type: 'enum', enum: CertificationType })
  type: CertificationType;

  @Column()
  fileUrl: string;

  @Column({ type: 'enum', enum: CertificationReviewStatus, default: CertificationReviewStatus.PENDING })
  status: CertificationReviewStatus;

  @Column({ type: 'text', nullable: true })
  adminComment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ExpertProfile, ep => ep.certifications)
  @JoinColumn({ name: 'expertProfileId' })
  expertProfile: ExpertProfile;
}
