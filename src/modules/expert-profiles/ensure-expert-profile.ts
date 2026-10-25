import { EntityManager } from 'typeorm';
import { ExpertProfile } from './expert-profile.entity';

// 명인 프로필 행을 보장한다 — 앱에 프로필 생성(POST /expert-profiles/me) 단계가 없어
// 명인 가입/전환/명인 화면 진입 시점에 빈 프로필을 만든다. 동시 요청에도 userId unique 충돌 없이 한 행만 생성.
export async function ensureExpertProfile(manager: EntityManager, userId: number): Promise<ExpertProfile> {
  await manager
    .createQueryBuilder()
    .insert()
    .into(ExpertProfile)
    .values({ userId, region: '', centerName: '', representativeService: '' })
    .orIgnore()
    .execute();
  return manager.findOneOrFail(ExpertProfile, { where: { userId } });
}

// 목록 노출용 명인 이름 — centerName 입력 화면이 없어 비어 있으면 닉네임으로 대체
export function expertDisplayName(ep: ExpertProfile): string {
  return ep.centerName || ep.user?.nickname || '';
}
