import { EntityManager } from 'typeorm';
import { ExpertProfile } from './expert-profile.entity';
import { userDisplayName } from '../users/user-display-name';

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
  return manager.findOneOrFail(ExpertProfile, { where: { userId }, relations: { user: true } });
}

// 명인 표시 이름 — 닉네임, 없으면 이름 (ep.user relation 로드 필요)
export function expertDisplayName(ep: ExpertProfile): string {
  return userDisplayName(ep.user);
}
