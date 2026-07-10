import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';

export enum AdCampaignStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('ad_campaigns')
export class AdCampaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  expertProfileId: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'enum', enum: AdCampaignStatus, default: AdCampaignStatus.PENDING })
  status: AdCampaignStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ExpertProfile, ep => ep.adCampaigns)
  @JoinColumn({ name: 'expertProfileId' })
  expertProfile: ExpertProfile;
}
