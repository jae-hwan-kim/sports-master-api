import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatRoom } from '../chat-rooms/chat-room.entity';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { User } from '../users/user.entity';
import { ReviewDeleteRequest } from './review-delete-request.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  chatRoomId: number;

  @Column()
  expertProfileId: number;

  @Column()
  customerId: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'jsonb', default: [] })
  imageUrls: string[];

  @Column({ unique: true, nullable: true })
  kakaoReviewToken: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => ChatRoom, cr => cr.review)
  @JoinColumn({ name: 'chatRoomId' })
  chatRoom: ChatRoom;

  @ManyToOne(() => ExpertProfile, ep => ep.reviews)
  @JoinColumn({ name: 'expertProfileId' })
  expertProfile: ExpertProfile;

  @ManyToOne(() => User, u => u.reviews)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @OneToMany(() => ReviewDeleteRequest, dr => dr.review)
  deleteRequests: ReviewDeleteRequest[];
}
