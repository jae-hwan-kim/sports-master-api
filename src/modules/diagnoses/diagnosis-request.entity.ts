import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';

export enum DiagnosisStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELETED = 'deleted',
}

export enum DiagnosisGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('diagnosis_requests')
export class DiagnosisRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column()
  expertProfileId: number;

  @Column()
  customerName: string;

  @Column({ type: 'int', nullable: true })
  customerAge: number | null;

  @Column({ type: 'enum', enum: DiagnosisGender, nullable: true })
  customerGender: DiagnosisGender | null;

  @Column({ nullable: true })
  customerRegion: string | null;

  @Column({ nullable: true })
  mainSport: string | null;

  @Column()
  customerPersonalCode: string;

  @Column({ type: 'enum', enum: DiagnosisStatus, default: DiagnosisStatus.PENDING })
  status: DiagnosisStatus;

  @Column({ type: 'boolean', default: false })
  isViewed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, u => u.diagnosisRequests)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => ExpertProfile, ep => ep.diagnosisRequests)
  @JoinColumn({ name: 'expertProfileId' })
  expertProfile: ExpertProfile;
}
