import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

// 명인이 보낸 리뷰 링크를 고객이 열었을 때의 방문 기록 — 리뷰 작성 목록(my-sent)에 명인을 추가하는 근거
// 고객·명인 쌍당 1행. FK는 두지 않음(기존 리뷰 링크는 토큰 검증으로 명인 존재를 확인)
@Entity('review_link_visits')
@Unique(['customerId', 'expertProfileId'])
export class ReviewLinkVisit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column()
  expertProfileId: number;

  @CreateDateColumn()
  createdAt: Date;
}
