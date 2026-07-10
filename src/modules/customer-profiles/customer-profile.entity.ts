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
import { DiagnosisRequest } from '../diagnoses/diagnosis-request.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('customer_profiles')
export class CustomerProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column()
  region: string;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ nullable: true })
  mainSport: string | null;

  @Column({ type: 'simple-array', nullable: true })
  symptoms: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  keywordTags: string[] | null;

  @Column({ type: 'int', nullable: true })
  weeklyExerciseCount: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, u => u.customerProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => DiagnosisRequest, dr => dr.customer)
  diagnosisRequests: DiagnosisRequest[];
}
