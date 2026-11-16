import { MigrationInterface, QueryRunner } from 'typeorm';

// 리뷰 링크 방문 기록 테이블 (운영은 synchronize 꺼짐 + migrationsRun → 마이그레이션 필수)
// IF NOT EXISTS로 이미 반영된 DB에서도 안전하게 실행
export class AddReviewLinkVisits1794100000000 implements MigrationInterface {
  name = 'AddReviewLinkVisits1794100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "review_link_visits" (
        "id" SERIAL NOT NULL,
        "customerId" integer NOT NULL,
        "expertProfileId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_review_link_visits_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_review_link_visits_customer_expert" UNIQUE ("customerId", "expertProfileId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "review_link_visits"`);
  }
}
