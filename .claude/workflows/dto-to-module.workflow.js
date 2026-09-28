export const meta = {
  name: 'dto-to-module',
  description: '도메인명 → 기존 Entity/DTO + Notion IA 기반 Module/Controller/Service 생성 (비용 최소화 구성)',
  phases: [
    { title: 'Notion 규칙 추출', detail: '저비용 에이전트가 도메인 관련 행만 골라 비즈니스 규칙 요약' },
    { title: '모듈 생성', detail: 'Entity/DTO를 직접 읽어 module/controller/service 생성' },
    { title: '통합 리뷰', detail: '구조/컨벤션/동작을 한 에이전트가 한번에 검토' },
    { title: '조건부 수정', detail: 'error/warning 있을 때만 Fixer 실행' },
  ],
};

// ─── Schema ────────────────────────────────────────────────────────────────

const CODE_SCHEMA = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'src/ 기준 상대 경로 (예: modules/auth/auth.service.ts)' },
          code: { type: 'string' },
        },
        required: ['path', 'code'],
      },
    },
    dependenciesNeeded: {
      type: 'array',
      items: { type: 'string' },
      description: 'package.json에 없어서 pnpm add 필요한 패키지 (예: bcrypt, @nestjs/jwt, passport-jwt)',
    },
    notes: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'dependenciesNeeded', 'notes'],
};

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['error', 'warning', 'suggestion'] },
          file: { type: 'string' },
          issue: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['severity', 'file', 'issue', 'fix'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['findings', 'summary'],
};

const FIX_SCHEMA = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          code: { type: 'string', description: '수정된 전체 파일 코드' },
          changes: { type: 'string' },
        },
        required: ['path', 'code', 'changes'],
      },
    },
    skipped: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'skipped'],
};

// ─── 입력 ──────────────────────────────────────────────────────────────────
// 사용: Workflow({ name: 'dto-to-module', args: { domain: 'auth' } })

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
const { domain } = parsedArgs ?? {};

if (!domain) {
  throw new Error('args.domain 이 필요합니다. 예: { domain: "auth" }');
}

const API_RULES = `
NestJS 컨벤션 (sports-master-api/CLAUDE.md, 반드시 준수):
- 도메인 하나당 module/controller/service 세트: modules/${domain}/${domain}.module.ts, .controller.ts, .service.ts
- @ApiTags(), @ApiOperation() 컨트롤러 필수
- 응답 타입은 @ApiDataResponse(Dto) 필수 — @ApiResponse({ type }) 직접 사용 금지
  (src/common/decorators/api-data-response.decorator.ts 에 이미 정의되어 있음, import해서 사용)
- 환경변수는 ConfigService만 사용, process.env 직접 접근 금지
- 에러는 HttpException 사용
- Logger는 NestJS 기본 Logger(new Logger(ClassName.name))
- Prettier: semi true, singleQuote, printWidth 120, arrowParens avoid, trailingComma all
`;

// ─── Phase 1: Notion 규칙 추출 (저비용) ─────────────────────────────────────

phase('Notion 규칙 추출');
log(`Notion IA에서 "${domain}" 도메인 관련 비즈니스 규칙 추출 중 (저비용 모드)...`);

const businessRules = await agent(
  `Notion MCP로 운동명인 앱의 IA를 조회해서, "${domain}" 도메인과 의미상 관련된 항목만 골라내세요.

도구 사용:
1. ToolSearch로 "mcp__notion__API-query-data-source" 로드
2. data_source_id "26b8ff2f-ac0d-8362-8ea5-07cdaae25d1e" (명인IA), "bb48ff2f-ac0d-8253-8756-0789ec060bf4" (고객IA) 각각 page_size 100으로 쿼리
3. 각 행의 Main/Depth1~4/기능 및 내용 설명/비고 필드를 조합해서, "${domain}" 도메인과 관련된 한글 표현(예: domain이 auth면 로그인/회원가입/카카오/애플/인증/탈퇴 등)에 해당하는 행만 골라냄
4. 관련 없는 행은 전부 버릴 것 — 전체 IA를 요약하지 말고 관련 행만 추출

출력: 관련 행들을 "{계층 경로} | {설명} | 비고: {비고}" 형식으로, 관련 없으면 "관련 항목 없음"만 반환.
전체 IA를 다시 출력하지 말 것 — 토큰 절약이 목적입니다.`,
  { label: 'Notion 규칙 추출 (필터)', effort: 'low', model: 'haiku' },
);

log('비즈니스 규칙 추출 완료.');

// ─── Phase 2: 모듈 생성 ──────────────────────────────────────────────────────

phase('모듈 생성');

const codeResult = await agent(
  `"${domain}" 도메인의 NestJS module/controller/service를 생성하세요.

절차:
1. Read 도구로 src/modules/${domain}/ 안의 entity/dto 파일을 직접 읽어서 필드/DTO 구조 파악 (코드를 다시 붙여넣지 말고 직접 읽을 것)
2. 아래 비즈니스 규칙을 반영해 서비스 로직 구현

=== ${domain} 관련 비즈니스 규칙 (Notion IA) ===
${businessRules}

${API_RULES}

생성 규칙:
1. Controller는 DTO의 모든 유스케이스에 대응하는 엔드포인트 작성
2. Service는 실제 로직 구현 (TypeORM Repository 사용, 미구현 스텁 금지)
3. 아직 package.json에 없는 패키지가 필요하면 코드에서 import는 하되 dependenciesNeeded에 명시 (직접 설치하지 말 것)
4. 파일 전체 코드 반환`,
  { schema: CODE_SCHEMA, label: 'Module Generator' },
);

log(
  `코드 생성 완료: ${codeResult.files.length}개 파일${codeResult.dependenciesNeeded.length ? `, 설치 필요 패키지: ${codeResult.dependenciesNeeded.join(', ')}` : ''}`,
);

const codeText = codeResult.files.map(f => `// ${f.path}\n${f.code}`).join('\n\n---\n\n');

// ─── Phase 3: 통합 리뷰 ──────────────────────────────────────────────────────

phase('통합 리뷰');
log('구조/컨벤션/동작 통합 검토 중...');

const review = await agent(
  `다음 NestJS 코드를 구조, 컨벤션 준수, 실제 동작 가능성 관점에서 한번에 검토하세요.

${API_RULES}

=== 코드 ===
${codeText}

검토 항목:
1. @ApiTags/@ApiOperation/@ApiDataResponse 누락 여부
2. ConfigService 미사용(process.env 직접 접근) 여부
3. TypeORM Repository 주입 및 사용 정합성
4. import 경로 및 파일 위치가 modules/${domain}/ 규칙과 일치하는지
5. 에러 처리(HttpException) 누락 여부

각 문제마다 severity, 파일, 문제, 수정 방법을 명시하세요. 문제 없으면 findings를 빈 배열로.`,
  { schema: REVIEW_SCHEMA, label: 'Reviewer: 통합' },
);

// ─── Phase 4: 조건부 수정 ────────────────────────────────────────────────────

phase('조건부 수정');

let fixResult = { files: [], skipped: ['리뷰에서 문제 발견되지 않아 수정 생략'] };

if (review.findings.length > 0) {
  log(`발견된 문제 ${review.findings.length}개 — 수정 적용 중...`);
  fixResult = await agent(
    `다음 리뷰 결과를 바탕으로 코드를 수정하세요.

=== 리뷰 결과 ===
${JSON.stringify(review.findings, null, 2)}

=== 현재 코드 ===
${codeText}

${API_RULES}

수정 규칙: error/warning은 반드시 수정, suggestion은 판단하여 적용. 수정 불필요 파일은 files에서 제외. 파일 전체 코드 반환.`,
    { schema: FIX_SCHEMA, label: 'Fixer' },
  );
  log(`수정 완료: ${fixResult.files.length}개 파일 수정`);
} else {
  log('리뷰에서 문제 발견되지 않음 — 수정 단계 생략 (비용 절감).');
}

return {
  domain,
  businessRules,
  generated: codeResult,
  review,
  fix: fixResult,
};
