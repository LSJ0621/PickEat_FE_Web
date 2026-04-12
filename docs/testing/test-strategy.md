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
Vitest (Unit 테스트):
  Hook Unit 테스트 (MSW)            █████████████     65%   (17개 파일)
  Utils Unit 테스트                 ████████          35%   (9개 파일)

E2E 테스트 (Playwright):            별도 실행          (e2e/ 디렉토리)
```

> **참고**: E2E 테스트는 Playwright로 별도 실행되며 Vitest 비중에 포함하지 않는다.
> Utils 비중이 높은 이유: format, validation, error, jwt, cn 등 순수 함수 유틸리티가 많아 테스트 파일 수가 늘어남.

---

## 2. 테스트 유형과 역할

### 2.1 Hook Unit 테스트 (Frontend 메인)

**역할**: 프론트엔드 비즈니스 로직(데이터 가져오기, 상태 관리, 사용자 액션 처리)을 검증한다.

**대상 Hook** (17개):

| Hook | 이유 |
|------|------|
| useEmailVerification | 이메일 인증 상태 전이가 복잡 |
| useVerificationTimer | 타이머 시작/만료/정지/초기화 |
| useOAuthRedirect | RE_REGISTER 에러 분기 처리 |
| useAddressSearch | 검색/선택/클리어 시나리오 |
| useAddressList | 목록 로드/기본 주소 변경/삭제/최대 선택 제약 |
| useAddressModal | 주소 검색/선택/추가/최대 제한/초기화 |
| useAgentActions | AI 추천 액션 처리 (SSE 병렬, 캐시, 취소) |
| useStreamingRequest | SSE 이벤트 수신/최소 표시 시간/타입별 처리 |
| usePlaceDetails | 장소 상세 로딩/상태 전환/에러/placeId 변경 |
| usePlaceSelection | 장소 선택 모달/API/Google 가게 차단 |
| useDebounce | 타이밍 로직 (지연/연속 입력/엣지 케이스) |
| useErrorHandler | 에러 타입 분류/toast 호출/성공 메시지 |
| useInitialDataLoad | StrictMode 이중 실행 방지/경로 변경 재로드 |
| useRatingPrompt | localStorage 플래그/pending rating/영구 숨김 |
| usePreferences | 취향 CRUD/Redux 동기화/저장·로드 API |
| useDateFilter | 날짜 필터 상태/오늘 선택/초기화/콜백 |
| useOnboarding | 온보딩 스텝 이동/완료·스킵/localStorage/CustomEvent |

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

**내부 훅 의존성 원칙**:

Hook이 다른 Hook을 내부에서 호출하는 경우(예: `useConfirmModal`이 `useModalScrollLock`, `useEscapeKey` 호출), 그 의존성 훅의 호출 여부나 인자는 검증하지 않는다.

```typescript
// useConfirmModal.ts
export function useConfirmModal() {
  useModalScrollLock(); // 내부 의존성
  useEscapeKey(handleClose);

  const [showCard, setShowCard] = useState(false);
  return { showConfirmCard: showCard, setShowCard };
}

// ✅ 좋음: 훅이 반환하는 상태/함수만 검증
expect(result.current.showConfirmCard).toBe(false);
act(() => result.current.setShowCard(true));
expect(result.current.showConfirmCard).toBe(true);

// ❌ 나쁨: 내부 의존성 호출 검증
expect(mockUseModalScrollLock).toHaveBeenCalled();
expect(mockUseEscapeKey).toHaveBeenCalledWith(handleClose);
```

**이유**:
- 내부 의존성의 정상 동작은 **의존성 자체의 Unit 테스트**에서 검증되어야 한다 (또는 전략 부록에 "테스트하지 않는 트리비얼 훅"으로 명시).
- 호출 검증은 리팩토링 시 테스트가 깨지게 만들어 유지보수 비용을 높인다.
- 관찰 가능한 행동(반환 상태, 사이드 이펙트로 인한 외부 가시적 변화)만 테스트 대상이다.

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

### Mock 허용 범위 명확화

"외부 API" 정의: **비용이 발생하거나 외부 서비스에 응답을 받아오는 연동**.

**Mock 허용 대상**:
1. **외부 API Client** (HTTP/SDK 경계, 과금/외부 응답)
   - OpenAI, Gemini, Google Places, OAuth(Google/Kakao), AWS S3, Discord Webhook
   - mock 필수 (실제 API 호출 금지)
2. **외부 API 래퍼 내부 Service**
   - `OpenAiMenuService`, `GeminiPlacesService` 등 이름에 외부 제공자가 들어가고 내부적으로 외부 API를 호출하는 Service
   - 외부 Client와 동등 취급, mock 허용
3. **동일 도메인 내 분리 Service** (책임 분리 구조)
   - 예: `auth.service`가 `AuthTokenService`/`AuthSocialService`/`AuthPasswordService`를 호출
   - 도메인 루트 Service의 Unit 테스트에서 분리 Service mock 허용

**Mock 금지 대상**:
4. **다른 도메인의 내부 Service**
   - 예: `place.service`가 `UserAddressService`를 호출
   - mock 금지 — 실제 인스턴스 또는 실제 의존성 체인 사용 (Repository는 경량 mock 허용)
5. **Repository는 실제 test DB 또는 경량 mock 허용** (TypeORM 규약)

**Mock 철학**:
- 단, §6.1 "행동 테스트, 구현 검증 금지" 엄수 — `toHaveBeenCalledWith` 같은 내부 호출 검증 금지
- Mock은 "외부 경계 차단"이 목적, "내부 로직 추적"이 목적이 아님

---

## 5. 디렉토리 구조

```
pickeat_web/
├── tests/
│   ├── hooks/                            # Hook Unit 테스트
│   │   ├── useEmailVerification.test.ts
│   │   ├── useVerificationTimer.test.ts
│   │   ├── useOAuthRedirect.test.tsx
│   │   ├── useAgentActions.test.tsx
│   │   ├── useStreamingRequest.test.ts
│   │   ├── useAddress.test.ts
│   │   ├── useInitialDataLoad.test.tsx
│   │   ├── useRatingPrompt.test.ts
│   │   ├── useDebounce.test.ts
│   │   ├── useDateFilter.test.ts
│   │   ├── useErrorHandler.test.ts
│   │   ├── useOnboarding.test.ts
│   │   ├── usePlaceDetails.test.ts
│   │   ├── usePlaceSelection.test.tsx
│   │   ├── usePreferences.test.tsx
│   │   ├── useAddressList.test.tsx
│   │   └── useAddressModal.test.tsx
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
│   ├── address.spec.ts
│   ├── auth.spec.ts
│   ├── menu-recommendation.spec.ts
│   └── mypage.spec.ts
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
npx vitest run tests/hooks/useEmailVerification.test.ts
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
