import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { User } from '../users/user.entity';
import { Review } from '../reviews/review.entity';

export enum ChatRoomStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  expertProfileId: number;

  @Column()
  customerId: number;

  @Column({ type: 'enum', enum: ChatRoomStatus, default: ChatRoomStatus.WAITING })
  status: ChatRoomStatus;

  @Column({ type: 'timestamp', nullable: true })
  reviewRequestSentAt: Date | null;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ExpertProfile, ep => ep.chatRooms)
  @JoinColumn({ name: 'expertProfileId' })
  expertProfile: ExpertProfile;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @OneToOne(() => Review, r => r.chatRoom)
  review: Review;
}
