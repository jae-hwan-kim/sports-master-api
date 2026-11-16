import { MigrationInterface, QueryRunner } from 'typeorm';

// 명인 전용 표시명 컬럼 추가 (운영은 synchronize 꺼짐 + migrationsRun → 마이그레이션 필수)
// IF NOT EXISTS로 이미 반영된 DB에서도 안전하게 실행
export class AddExpertDisplayName1794000000000 implements MigrationInterface {
  name = 'AddExpertDisplayName1794000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expert_profiles" ADD COLUMN IF NOT EXISTS "displayName" character varying(20)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "expert_profiles" DROP COLUMN IF EXISTS "displayName"`);
  }
}
