# PickEat Frontend 테스트 전략

## 목차

1. [테스트 철학](#1-테스트-철학)
2. [테스트 유형과 역할](#2-테스트-유형과-역할)
3. [Frontend 테스트 전략](#3-frontend-테스트-전략)
4. [테스트 작성 규칙](#4-테스트-작성-규칙)
5. [디렉토리 구조](#5-디렉토리-구조)
6. [테스트 실행](#6-테스트-실행)

---

## 1. 테스트 철학

### 원칙

**적게 쓰고, 중요한 곳만, 제대로.**

- 50개 서비스를 대충 테스트하지 말고, 핵심 7개를 제대로 테스트한다
- 가짜(mock) 덩어리 테스트보다, 진짜 앱을 띄워서 검증하는 테스트를 우선한다
- "이 테스트가 없으면 배포할 때 뭐가 터질 수 있는가?"로 테스트 대상을 결정한다

### 테스트하는 것 vs 안 하는 것

| 테스트한다 | 테스트하지 않는다 |
|-----------|----------------|
| 프론트엔드 핵심 Hook | 단순 UI 렌더링 (버튼 있는지, 텍스트 보이는지) |
| E2E 핵심 사용자 시나리오 | CSS 클래스/스타일 |

### 테스트 비중

```
Frontend:
  Hook Unit 테스트 (MSW)            ████████████      50%
  E2E 테스트 (Playwright)           ██████████        40%
  Utils Unit 테스트                 ███               10%
```

---

## 2. 테스트 유형과 역할

### 2.1 Hook Unit 테스트 (Frontend 메인)

**역할**: 프론트엔드 비즈니스 로직(데이터 가져오기, 상태 관리, 사용자 액션 처리)을 검증한다.

**대상 Hook** (핵심만):

| Hook | 이유 |
|------|------|
| useEmailVerification | 이메일 인증 상태 전이가 복잡 |
| useAddressSearch | 검색/선택/클리어 시나리오 |
| useAgentActions | AI 추천 액션 처리 |
| useAuth | 로그인/로그아웃/토큰 관리 |
| useMenuSelection | 메뉴 선택/저장 |
| useDebounce | 타이밍 로직 |
| useLocalStorage | 저장/불러오기/삭제 |

**검증 방식**: MSW로 API를 mocking하고, Hook의 상태 변화를 검증한다.

```typescript
it('검색어 입력 후 결과를 반환한다', async () => {
  // MSW가 가짜 API 응답을 반환
  const { result } = renderHook(() => useAddressSearch());

  act(() => result.current.search('강남역'));

  await waitFor(() => {
    expect(result.current.results).toHaveLength(5);
    expect(result.current.isLoading).toBe(false);
  });
});
```

### 2.2 E2E 테스트 (Frontend 보조)

**역할**: 사용자 관점에서 핵심 시나리오가 처음부터 끝까지 동작하는지 확인한다.

**대상 시나리오** (5-7개만):

| 시나리오 | 검증 내용 |
|---------|----------|
| 회원가입 → 로그인 | 가입 폼 입력 → 이메일 인증 → 로그인 성공 |
| 메뉴 추천 받기 | 프롬프트 입력 → AI 응답 수신 → 추천 결과 표시 |
| 주소 검색 → 등록 | 주소 입력 → 자동완성 → 선택 → 저장 |
| 맛집 추천 → 지도 확인 | 추천 결과에서 가게 선택 → 지도 표시 → 상세 정보 |
| 마이페이지 정보 수정 | 프로필 수정 → 저장 → 반영 확인 |

**검증 방식**: Playwright로 실제 브라우저에서 클릭/입력/확인한다.

```typescript
test('로그인 후 메뉴 추천을 받을 수 있다', async ({ page }) => {
  // 로그인
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@test.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // 메뉴 추천
  await page.waitForURL('/');
  await page.fill('[name="prompt"]', '매운 음식 추천해줘');
  await page.click('button:has-text("추천")');

  // 결과 확인
  await expect(page.locator('.recommendation-card')).toHaveCount(3);
});
```

---

## 3. Frontend 테스트 전략

### 3.1 Hook Unit 테스트

핵심 비즈니스 로직을 담당하는 Hook만 테스트한다.

**테스트하는 Hook**: 비즈니스 로직이 있는 것 (상태 관리, API 호출, 데이터 변환)
**테스트하지 않는 Hook**: 단순 UI 상태만 관리하는 것 (모달 열기/닫기, 토글 등)

### 3.2 컴포넌트 테스트

**하지 않는다.**

이유:
- 단순 렌더링 확인은 가치 없음 (눈으로 보면 됨)
- CSS 클래스 검증은 리팩토링할 때 깨지기만 하고 버그는 못 잡음
- 복잡한 상호작용은 E2E에서 검증하는 게 더 신뢰성 있음
- Hook에 로직을 분리하면, 컴포넌트는 Hook을 호출하고 결과를 보여주는 역할만 함

### 3.3 Utils 테스트

순수 함수(입력 → 출력)인 유틸리티만 테스트한다.

**대상**: format, validation, error, jwt, cn(className) 등

### 3.4 Store 테스트

**하지 않는다.** Hook 테스트와 E2E에서 간접 커버된다.

### 3.5 API Service 테스트

**하지 않는다.** Hook 테스트에서 MSW를 통해 간접 커버된다.

### 3.6 E2E 테스트

핵심 사용자 시나리오 5-7개만 Playwright로 검증한다. 모든 페이지를 테스트하지 않는다.

---

## 4. 테스트 작성 규칙

### 4.1 행동을 테스트한다, 구현을 테스트하지 않는다

```typescript
// 좋음: 결과를 검증
expect(result.status).toBe('PENDING');
expect(result.recommendations).toHaveLength(3);
expect(response.status).toBe(201);

// 나쁨: 내부 호출을 검증
expect(mockRepository.save).toHaveBeenCalled();
expect(mockService.recommend).toHaveBeenCalledWith(prompt);
```

### 4.2 테스트 이름은 시나리오를 설명한다

```typescript
// 좋음: 읽으면 뭘 검증하는지 알 수 있음
it('필수 필드 없이 회원가입하면 400 에러를 반환한다')
it('만료된 토큰으로 접근하면 401 에러를 반환한다')

// 나쁨: 무슨 뜻인지 모름
it('should work')
it('register test')
it('handles error')
```

### 4.3 하나의 테스트는 하나의 시나리오

```typescript
// 좋음: 각 시나리오가 독립적
it('이메일 형식이 잘못되면 400 에러', ...)
it('비밀번호가 6자 미만이면 400 에러', ...)
it('이미 존재하는 이메일이면 409 에러', ...)

// 나쁨: 여러 시나리오를 하나에 몰아넣음
it('회원가입 검증 테스트', () => {
  // 이메일 검증도 하고...
  // 비밀번호 검증도 하고...
  // 중복 검증도 하고...
});
```

### 4.4 테스트 데이터는 Factory 사용

```typescript
// 좋음: Factory로 일관된 테스트 데이터
const user = UserFactory.create({ email: 'test@test.com' });
const menu = MenuRecommendationFactory.create({ userId: user.id });

// 나쁨: 테스트마다 하드코딩
const user = { id: 1, email: 'test@test.com', password: '...',  ... };
```

### 4.5 CSS/스타일 검증 금지

```typescript
// 금지: CSS 클래스 검증
expect(button).toHaveClass('px-8', 'py-6', 'text-lg');
expect(heading).toHaveClass('text-5xl', 'font-bold');

// 허용: 기능 검증
expect(button).toBeDisabled();
expect(input).toHaveValue('test@test.com');
```

### 4.6 Mock은 최소한으로

- **Frontend Hook 테스트**: MSW로 API만 mock
- **Frontend E2E**: 백엔드 mock 서버 사용 (E2E_MOCK=true)

---

## 5. 디렉토리 구조

```
pickeat_web/
├── tests/
│   ├── hooks/                            # Hook Unit 테스트
│   │   ├── auth/
│   │   │   ├── useAuth.test.ts
│   │   │   └── useEmailVerification.test.ts
│   │   ├── agent/
│   │   │   └── useAgentActions.test.ts
│   │   ├── address/
│   │   │   └── useAddressSearch.test.ts
│   │   └── common/
│   │       ├── useDebounce.test.ts
│   │       └── useLocalStorage.test.ts
│   ├── utils/                            # Utils 테스트
│   │   ├── format.test.ts
│   │   ├── validation.test.ts
│   │   └── error.test.ts
│   ├── mocks/                            # MSW 설정
│   │   ├── server.ts
│   │   ├── handlers.ts
│   │   └── handlers/
│   ├── factories/                        # 테스트 데이터
│   └── setup.ts                          # 전역 설정
├── e2e/                                  # E2E 테스트
│   ├── auth/
│   │   └── login-and-register.spec.ts
│   ├── features/
│   │   ├── menu-recommendation.spec.ts
│   │   ├── address-search.spec.ts
│   │   ├── restaurant-map.spec.ts
│   │   └── profile-edit.spec.ts
│   └── smoke.spec.ts
├── vitest.config.ts
└── playwright.config.ts
```

---

## 6. 테스트 실행

```bash
# Hook/Utils Unit 테스트
npm run test:run

# E2E 테스트
npm run test:e2e

# 커버리지
npm run test:coverage

# 특정 파일만
npx vitest run tests/hooks/auth/useAuth.test.ts
```

### CI에서의 실행 순서

```
1. Frontend Unit 테스트 (빠름, 30초)
2. Frontend E2E 테스트 (느림, 5-10분)
```

실패 시 다음 단계로 넘어가지 않는다.

---

## 부록: Frontend Utils 중 테스트하지 않는 함수

아래 함수들은 분기 없는 단순 위임/상수이므로 단위 테스트 대상에서 제외한다.

| 파일 | 함수/상수 | 제외 이유 |
|------|-----------|-----------|
| `constants.ts` | 전체 (STORAGE_KEYS, API_CONFIG 등 13개) | 정적 상수 객체. 로직 없음, TypeScript 타입 체크로 충분 |
| `motion.ts` | fadeInUp, fadeIn 등 6개 | Framer Motion 애니메이션 variant 상수. 분기 없음 |
| `format.ts` | `formatDateTime()` | `formatDate()`에 포맷 기본값만 전달하는 1줄 위임 (이미 테스트됨) |
| `format.ts` | `formatDateKorean()` | `toLocaleDateString('ko-KR')` 직접 호출. 분기 없음 |
| `format.ts` | `formatDateTimeKorean()` | `toLocaleString('ko-KR')` 직접 호출. 분기 없음 |
| `googleMap.ts` | `createUserLocationMarkerContent()` | 고정 텍스트/스타일의 정적 HTML 생성. 분기 없음 |
| `googleMapLoader.ts` | `getGoogleMapId()` | `import.meta.env` 접근 + fallback 빈 문자열. 1줄 |
