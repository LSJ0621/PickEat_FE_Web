# Phase 4: Components Features Part 1 코드 리뷰 리포트

## 요약

| 카테고리 | Critical | Warning | Suggestion |
|---------|----------|---------|------------|
| Restaurant Map | 6 | 7 | 10 |
| Restaurant List & Details | 4 | 11 | 12 |
| Agent + Menu | 0 | 8 | 10 |
| **합계** | **10** | **26** | **32** |

---

## 1. Restaurant Map Components (Agent 4-A)

### tests/components/features/restaurant/RestaurantMapModal.test.tsx

#### Critical
- **[LINE:427-468, 580-602, 606-621, 1283-1302, 1376-1459]** `expect(true).toBe(true)` 사용 - 실제 테스트 아님
  ```typescript
  // 현재 (무의미)
  it('50회 폴링 후 타임아웃 에러 - documented behavior', () => {
    expect(true).toBe(true);
  });

  // 수정: 실제 테스트 구현 또는 삭제
  ```

- **[LINE:310-333]** `import.meta.env` 직접 수정 - 다른 테스트에 영향
  ```typescript
  // 권장: vi.stubEnv 사용
  vi.stubEnv('VITE_NAVER_MAP_CLIENT_ID', '');
  ```

#### Warnings
- **[LINE:343, 503]** `document.head.appendChild` 직접 모킹 - 복원 보장 필요
- **[LINE:790-821]** `HTMLElement.prototype.offsetWidth` 수정 - try-finally 패턴 권장
- **[LINE:56]** 복잡한 타입 캐스팅 반복 - 유틸리티 함수로 추출
- **[LINE:87]** CSS 클래스 셀렉터 사용 (`data-testid` 권장)

#### Suggestions
- [LINE:7-19] `createMockRestaurant` factory 추출
- [LINE:21-59] `setupNaverMapsMock` 공통화
- [LINE:1087-1144] fake timers `afterEach` 복원

---

### tests/components/features/restaurant/PlaceMiniMap.test.tsx

#### Warnings
- **[LINE:4]** `@tests/` 경로 별칭 - CLAUDE.md는 `@/`만 언급
- **[LINE:339-351]** `document.head.appendChild` 직접 모킹
- **[LINE:541-583]** `console.error` 복원 보장 필요
- **[LINE:122-123]** CSS 클래스 셀렉터 사용

#### Suggestions
- [LINE:11-36] `setupNaverMapsMock` 중복 - 공통화 필요
- [LINE:811-845] `<StrictMode>` 실제 사용 테스트 권장

---

## 2. Restaurant List & Details (Agent 4-B)

### tests/components/features/restaurant/RestaurantList.test.tsx

#### Warnings
- **[LINE:119, 128]** CSS 클래스로 DOM 검색 (`.animate-spin`)

#### Suggestions
- [LINE:10-21] `createMockRestaurant` factory 추출
- [LINE:23-30] `window.location` 모킹 `beforeEach`/`afterEach`로 이동

---

### tests/components/features/restaurant/RestaurantListItem.test.tsx

#### Warnings
- **[LINE:101-118]** 스타일 클래스 테스트 - 구현 세부사항 의존
- **[LINE:127, 138, 149, 160]** 복합 CSS 선택자 사용

#### Suggestions
- [LINE:7-18] `createMockRestaurant` 중복
- [LINE:96] 이모지 대신 aria-label 사용 권장

---

### tests/components/features/restaurant/PlaceDetailsModal.test.tsx

#### Critical
- **[LINE:2]** 미사용 import `act` 제거 필요

#### Warnings
- **[LINE:19-22]** Naver Maps mock `this` 타입 미명시
- **[LINE:92-93, 288]** CSS 클래스 선택자 사용

---

### tests/components/features/restaurant/PlaceReviewsSection.test.tsx

#### Critical
- **[LINE:27-28]** `null as unknown as []` 타입 우회
  ```typescript
  // 현재
  <PlaceReviewsSection reviews={null as unknown as []} />

  // 권장: 컴포넌트 props에 null 허용 추가
  ```

#### Warnings
- **[LINE:214, 222]** CSS 클래스 스타일 테스트

---

### tests/components/features/restaurant/PlaceBlogsSection.test.tsx

#### Critical
- **[LINE:219, 229, 241, 255]** `any` 타입 사용 - CLAUDE.md 위반
  ```typescript
  // 현재
  vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: null as any });
  let firstResolve: (value: any) => void;

  // 권장
  import type { RestaurantBlogsResponse } from '@/types/menu';
  let firstResolve: (value: RestaurantBlogsResponse) => void;
  ```

#### Warnings
- **[LINE:47]** CSS 클래스 (`.animate-spin`) 사용

#### Suggestions
- [LINE:285, 335] `setTimeout` 대신 fake timer 사용 권장

---

## 3. Agent + History + Menu (Agent 4-C)

### tests/components/features/agent/ResultsSection.test.tsx

#### Warnings
- **[LINE:274, 299]** 미사용 변수 `container`
- **[LINE:660, 674, 706]** 약한 assertion - CSS 클래스 존재만 확인
- **[LINE:896, 935, 1027, 1062]** `expect(true).toBe(true)` 무의미한 테스트

#### Suggestions
- [LINE:845-897] `scrollIntoView` 실제 호출 검증 추가
- [LINE:49-99] 상태 객체 factory 사용 권장

---

### tests/components/features/agent/ResultsTabs.test.tsx

#### Warnings
- **[LINE:140, 149]** 미사용 변수 `container`

#### Suggestions
- [LINE:282-286] `if (aiTab)` 대신 non-null assertion 사용

---

### tests/components/features/history/HistoryItem.test.tsx

#### Warnings
- **[LINE:22-47]** `unknown[]` 대신 구체적 타입 사용 권장
- **[LINE:455-458]** null 할당 시 타입 오류 가능성

#### Suggestions
- [LINE:81-108] Mock 컴포넌트 props 타입 정의
- [LINE:140-202] 날짜 포맷 정확한 출력 검증

---

### tests/components/features/menu/MenuSelectionEditModal.test.tsx

#### Warnings
- **[LINE:357]** `apiCalledWith: unknown` - 명시적 타입 권장
- **[LINE:25-28]** `requestAnimationFrame` stub `beforeAll`로 이동

#### Suggestions
- [LINE:33-58] MSW handler 헬퍼 함수 추출
- [LINE:791-829] 애니메이션 테스트 시각적 변화 검증

---

### tests/components/features/menu/MenuSelectionModal.test.tsx

#### Warnings
- **[LINE:251]** boolean flag 대신 `vi.fn()` 사용 권장
  ```typescript
  // 현재
  let apiCalled = false;

  // 권장
  const apiHandler = vi.fn(() => HttpResponse.json({ success: true }));
  ```

#### Suggestions
- [LINE:80-99] `if (menuButton)` 대신 assertion 사용
- [LINE:401-432] 에러 메시지 표시 검증 추가

---

### tests/components/features/menu/MenuRecommendation.test.tsx

#### Warnings
- **[LINE:20-40]** 인라인 상태 객체 - factory 사용 권장
- **[LINE:132-133]** boolean flag 대신 mock function

#### Suggestions
- [LINE:363-385] 미인증 사용자 피드백 검증 추가
- [LINE:461-477] 애니메이션 클래스 대신 접근성 테스트

---

## 반복되는 패턴 이슈

### 1. `expect(true).toBe(true)` 무의미한 테스트
영향받는 파일:
- RestaurantMapModal.test.tsx (다수)
- ResultsSection.test.tsx (4곳)

### 2. Naver Maps Mock 중복
- RestaurantMapModal.test.tsx
- PlaceMiniMap.test.tsx

**권장**: `/tests/mocks/naverMaps.ts` 공통 파일 생성

### 3. `createMockRestaurant` 중복
- RestaurantList.test.tsx
- RestaurantListItem.test.tsx

**권장**: `/tests/factories/restaurant.ts` 추가

### 4. CSS 클래스 기반 선택자 (전체 파일)
```typescript
// 문제
document.querySelector('.animate-spin');
container.querySelector('.space-y-4');

// 권장
screen.getByTestId('loading-spinner');
screen.getByRole('list');
```

### 5. Boolean Flag vs Mock Function
```typescript
// 문제
let apiCalled = false;
// handler 내부
apiCalled = true;

// 권장
const apiHandler = vi.fn();
server.use(http.post('*/api', apiHandler));
expect(apiHandler).toHaveBeenCalled();
```

---

## 우수 사례

1. MSW를 활용한 API 모킹 적절히 구현
2. `userEvent` 사용으로 실제 사용자 행동 시뮬레이션
3. 키보드 접근성 테스트 포함 (Enter, Space)
4. Race condition 테스트 포함 (PlaceBlogsSection)
5. StrictMode 대응 테스트 포함
6. `@/` 절대 경로 사용 규칙 준수

---

## 우선 수정 필요 항목

1. **긴급**: `expect(true).toBe(true)` 테스트 실제 구현 또는 삭제
2. **긴급**: `any` 타입 제거 (PlaceBlogsSection)
3. **높음**: 미사용 import/변수 제거
4. **높음**: Naver Maps mock 공통화
5. **중간**: CSS 클래스 선택자를 data-testid로 대체
6. **낮음**: Boolean flag를 mock function으로 대체
