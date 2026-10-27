import { User } from './user.entity';

// 화면 표시용 이름 — 닉네임이 없으면(소셜 가입자) 소셜 제공자 이름으로 대체
export function userDisplayName(user: Pick<User, 'nickname' | 'name'> | null | undefined): string {
  return user?.nickname || user?.name || '';
}
