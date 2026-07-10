import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';

@Entity('favorite_experts')
@Unique(['customerId', 'expertProfileId'])
export class FavoriteExpert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column()
  expertProfileId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, u => u.favoriteExperts)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => ExpertProfile, ep => ep.favoritedBy)
  @JoinColumn({ name: 'expertProfileId' })
  expertProfile: ExpertProfile;
}
