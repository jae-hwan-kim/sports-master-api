import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatRoom } from '../chat-rooms/chat-room.entity';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { User } from '../users/user.entity';

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
}
