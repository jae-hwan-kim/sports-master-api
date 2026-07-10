# Sports Master API — 개발 컨텍스트

## 프로젝트 개요

- **프레임워크**: NestJS
- **언어**: TypeScript
- **패키지매니저**: pnpm
- **로깅**: Winston + nest-winston
- **에러트래킹**: Sentry (@sentry/node)
- **API 문서**: Swagger (@nestjs/swagger) — `/swagger`
- **유효성 검사**: class-validator + class-transformer
- **환경변수**: @nestjs/config (ConfigService)

---

## 폴더 구조

```
src/
├── common/
│   ├── filters/        # 전역 예외 필터
│   ├── interceptors/   # 응답 인터셉터
│   └── pipes/          # 커스텀 파이프
├── config/             # 환경변수, 로거 설정
├── modules/            # 기능별 도메인 모듈
│   └── {domain}/
│       ├── {domain}.module.ts
│       ├── {domain}.controller.ts
│       ├── {domain}.service.ts
│       └── dto/
│           ├── create-{domain}.dto.ts
│           └── {domain}-response.dto.ts
└── main.ts
```

---

## NestJS 개발 규칙

### 모듈 생성

기능 단위로 모듈 분리 — 도메인 하나당 module/controller/service 세트

```bash
nest g module modules/{domain}
nest g controller modules/{domain}
nest g service modules/{domain}
```

### DTO 규칙 (필수)

- 요청 DTO와 응답 DTO 분리
- `class-validator` 데코레이터 필수
- `@ApiProperty()` 필수 — Swagger 자동 생성 소스이며, 프론트 타입 생성의 원천

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '사용자 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### 컨트롤러 규칙

- `@ApiTags()` 필수 — Swagger 그룹핑
- `@ApiOperation()` 필수 — 엔드포인트 설명
- **응답 타입은 `@ApiDataResponse(Dto)` 필수** — `@ApiResponse({ type })` 직접 사용 금지 (아래 응답 포맷 참고)

```typescript
@ApiTags('users')
@Controller('users')
export class UserController {
  @ApiOperation({ summary: '사용자 생성' })
  @ApiDataResponse(UserResponseDto)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
```

### 응답 포맷 (필수 규약)

전역 `ResponseInterceptor`가 모든 성공 응답을 `{ data: T }`로 래핑 (`APP_INTERCEPTOR`로 등록).

- 성공: `{ data: T }`
- 실패: `{ statusCode, message, path, timestamp }` (GlobalExceptionFilter 처리)

**중요**: 런타임은 `{ data: T }`인데 Swagger에 unwrapped `T`만 노출하면 프론트 생성 타입이 실제 응답과 어긋난다.
반드시 `@ApiDataResponse()`(`src/common/decorators/api-data-response.decorator.ts`)로 래퍼를 스펙에 반영할 것.

```typescript
@ApiDataResponse(UserResponseDto)                 // → { data: UserResponseDto }
@ApiDataResponse(UserResponseDto, { isArray: true }) // → { data: UserResponseDto[] }
```

### 환경변수

`.env` 직접 접근 금지 → `ConfigService`만 사용

```typescript
// Bad
process.env.DATABASE_URL

// Good
constructor(private config: ConfigService) {}
this.config.get<string>('DATABASE_URL')
```

### 에러 처리

- HTTP 예외는 NestJS 기본 `HttpException` 사용
- 5xx 에러는 자동으로 Sentry 전송 (GlobalExceptionFilter)
- 커스텀 예외는 `HttpException` 상속

```typescript
throw new HttpException('Not found', HttpStatus.NOT_FOUND);
```

### 로깅

Logger는 NestJS 기본 Logger 사용 (내부적으로 Winston 연결됨)

```typescript
private readonly logger = new Logger(UserService.name);
this.logger.log('사용자 생성');
this.logger.error('에러 발생', error.stack);
```

---

## 커밋 메시지

```
feat: 기능 추가
fix: 버그 수정
refactor: 리팩토링
docs: 문서
chore: 설정, 빌드
test: 테스트
```

---

## 주요 스크립트

```bash
pnpm start          # 로컬 개발 서버
pnpm build          # 빌드
pnpm lint           # lint 검사
pnpm test           # 단위 테스트
```

---

## Swagger → 프론트 타입 연동

서버 실행 후 프론트(sports-master-web)에서:

```bash
pnpm generate-types  # http://localhost:3000/swagger-yaml → src/types/schema.ts
```

---

## 체크리스트 (PR 전)

```
□ DTO에 @ApiProperty() 전부 작성
□ 컨트롤러에 @ApiTags(), @ApiOperation() 작성
□ 응답에 @ApiDataResponse(Dto) — 래퍼 스펙 반영
□ ConfigService로만 환경변수 접근
□ lint 통과 (pnpm lint)
□ 빌드 통과 (pnpm build)
□ .env 파일 커밋 안 함
```
