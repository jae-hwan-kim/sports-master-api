import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';
import { User } from '../users/user.entity';

export enum DeleteRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('review_delete_requests')
export class ReviewDeleteRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reviewId: number;

  @Column()
  requestedById: number;

  @Column({ type: 'enum', enum: DeleteRequestStatus, default: DeleteRequestStatus.PENDING })
  status: DeleteRequestStatus;

  @CreateDateColumn()
  requestedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @ManyToOne(() => Review)
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;
}
