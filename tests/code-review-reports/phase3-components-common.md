# Phase 3: Components Common & Layout 코드 리뷰 리포트

## 요약

| 카테고리 | Critical | Warning | Suggestion |
|---------|----------|---------|------------|
| Modal Components | 4 | 6 | 12 |
| Header + Toast | 1 | 5 | 8 |
| Basic + Layout | 1 | 5 | 10 |
| **합계** | **6** | **16** | **30** |

---

## 1. Modal Components (Agent 3-A)

### tests/components/common/InitialSetupModal.test.tsx

#### Critical
- **[LINE:289, 337, 362, 365]** `any` 타입 사용
  ```typescript
  // 현재
  vi.mocked(authService.updateUser).mockResolvedValue({ name: '홍길동' } as any);
  vi.mocked(userService.setPreferences).mockResolvedValue(undefined as any);

  // 권장
  import type { User } from '@/types/user';
  vi.mocked(authService.updateUser).mockResolvedValue({ name: '홍길동' } as User);
  ```

#### Warnings
- [LINE:416-422] `rerender` 사용 시 wrapper 포함되지 않음

#### Suggestions
- [LINE:195-212] `screen.getByText('x')` 대신 `aria-label` 또는 `data-testid` 사용 권장
- [LINE:28-33] mock 설정을 별도 setup 파일로 분리 고려

---

### tests/components/common/AddressRegistrationModal.test.tsx

#### Warnings
- **[LINE:157, 338]** Alert 메시지 내용 검증 누락
  ```typescript
  // 현재
  expect(alertSpy).toHaveBeenCalled();

  // 권장
  expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('검색 실패'));
  ```
- [LINE:420-426] `rerender` wrapper 미포함

#### Suggestions
- 키보드 네비게이션 테스트 누락
- 디바운싱 테스트 추가 고려

---

### tests/components/common/AuthPromptModal.test.tsx

#### Warnings
- **[LINE:134]** CSS 클래스 선택자 사용 (취약함)
  ```typescript
  // 현재 (취약)
  const modal = document.body.querySelector('.fixed.inset-0.z-50');

  // 권장
  const modal = screen.getByTestId('auth-modal');
  ```
- **[LINE:197-222]** 스타일 테스트가 CSS 클래스에 의존

#### Suggestions
- Escape 키로 모달 닫기 테스트 누락
- 백드롭 클릭 테스트 누락
- 포커스 트래핑 테스트 추가 권장

---

### tests/components/common/ConfirmDialog.test.tsx

#### Warnings
- **[LINE:8-14]** mock 함수 초기화 누락 - `beforeEach`에서 `mockClear()` 필요
- **[LINE:63-79, 120-160]** CSS 클래스 기반 테스트 (취약함)

#### Suggestions
- `beforeEach`에 `vi.clearAllMocks()` 추가
- ARIA 역할/속성 테스트 추가 권장

---

## 2. Header + Toast (Agent 3-B)

### tests/components/common/AppHeader.test.tsx

#### Warnings
- **[LINE:54-56]** 불필요한 조건문 사용
  ```typescript
  // 현재
  if (logo) { await user.click(logo); }

  // 권장
  expect(logo).not.toBeNull();
  await user.click(logo!);
  ```

#### Suggestions
- [LINE:92-97] 이모지 기반 검증 대신 `data-testid` 사용 권장
- [LINE:173-190] CSS 클래스 의존 테스트 - 시각적 회귀 테스트 도구 고려

---

### tests/components/common/AppFooter.test.tsx

#### Warnings
- **[LINE:2]** import 중복 가능성 - `renderWithProviders`에서 통일 권장

#### Suggestions
- [LINE:229] `toBeGreaterThanOrEqual(5)` 대신 정확한 개수 검증 권장
- `jest-axe` 자동화 접근성 테스트 추가 고려

---

### tests/components/common/UserMenu.test.tsx

#### Critical
- **[LINE:220]** `any` 타입 사용
  ```typescript
  // 현재
  store.dispatch = vi.fn(originalDispatch) as any;

  // 권장
  store.dispatch = vi.fn(originalDispatch) as typeof store.dispatch;
  ```

#### Warnings
- **[LINE:9]** 미사용 변수: `mockDispatch`
- [LINE:2] import 불일치 - 통일 필요

---

### tests/components/common/Toast.test.tsx

#### Warnings
- **[LINE:147]** `closeButton.click()` 대신 `userEvent.click()` 사용 권장

#### Suggestions
- [LINE:91-133] Toast 아이콘 타입별 차이 검증 추가
- [LINE:219-243] 타이머 상태 복원 확인 필요

---

### tests/components/common/ToastProvider.test.tsx

#### Warnings
- **[LINE:2]** import 불일치 - `renderWithProviders`에서 통일 권장

#### Suggestions
- [LINE:249-277] StrictMode에서 추가 렌더링으로 인한 테스트 실패 가능성

---

### tests/components/common/StatusPopupCard.test.tsx

#### Warnings
- **[LINE:4]** `render` 직접 import - 일관성을 위해 `renderWithProviders` 사용 고려

#### Suggestions
- [LINE:268-292] variant별 시각적 차이 테스트 추가 권장

---

## 3. Basic + Layout (Agent 3-C)

### tests/components/common/Button.test.tsx

#### Suggestions
- Tab 네비게이션 테스트 추가 고려
- [LINE:14-24] CSS 클래스 테스트 대신 동작 테스트 권장

---

### tests/components/common/SkeletonCard.test.tsx

#### Warnings
- **[LINE:7-12 등]** `container.querySelector` CSS 클래스 선택자 의존 (취약함)

#### Suggestions
- [LINE:142-149] React key 유일성 검증 방법 개선 필요
- 스냅샷 테스트 추가 고려

---

### tests/components/common/ModalCloseButton.test.tsx

#### Critical
- **[LINE:1]** `beforeEach` import 누락
  ```typescript
  // 현재
  import { describe, it, expect, vi } from 'vitest';

  // 수정
  import { describe, it, expect, vi, beforeEach } from 'vitest';
  ```

#### Suggestions
- 키보드 상호작용 테스트 추가 (Escape, Enter)

---

### tests/components/common/OAuthLoadingScreen.test.tsx

#### Warnings
- **[LINE:54-59]** `as HTMLElement` 타입 단언 - `data-testid` 사용 권장

#### Suggestions
- [LINE:84-97] 중복 테스트 통합 고려
- 로딩 상태 aria-live 테스트 추가

---

### tests/components/common/PageLoadingFallback.test.tsx

#### Warnings
- **[LINE:24-31]** `as HTMLElement` 타입 단언 사용

#### Suggestions
- [LINE:83-96] CSS 구현 세부사항 테스트 - 동작 테스트로 대체 권장
- 로딩 상태 접근성 테스트 추가

---

### tests/components/common/AddressSearchResults.test.tsx

#### Warnings
- **[LINE:9]** mock 초기화 누락 - `beforeEach`에 `vi.clearAllMocks()` 추가 필요
- **[LINE:201-202, 219-220]** `.className.toContain()` 대신 `.toHaveClass()` 사용 권장

#### Suggestions
- [LINE:33-34] `getAllByText()[0]` 대신 더 구체적인 쿼리 사용
- 키보드 네비게이션 테스트 추가

---

### tests/components/layout/AppLayout.test.tsx

#### Warnings
- **[LINE:7-16]** `useLocation` mock이 항상 `{ pathname: '/' }` 반환 - 설정 가능하게 변경 권장
- **[LINE:247-249]** optional chaining이 null 케이스 무시 가능

#### Suggestions
- [LINE:8] `mockNavigate` 선언 후 미사용
- 반응형 동작 테스트 추가 고려

---

## 반복되는 패턴 이슈

### 1. CSS 클래스 기반 테스트 (전체 파일에서 발생)
```typescript
// 문제: 스타일 변경 시 테스트 실패
expect(element).toHaveClass('bg-blue-500', 'rounded-xl');

// 권장: data-testid 또는 동작 기반 테스트
expect(screen.getByTestId('button')).toBeVisible();
```

### 2. Import 불일치
- 일부 파일: `@testing-library/react`에서 직접 import
- 다른 파일: `renderWithProviders`에서 re-export 사용
- **권장**: `renderWithProviders`에서 통일

### 3. Mock 초기화 누락
여러 파일에서 `beforeEach`에 `vi.clearAllMocks()` 누락

### 4. 접근성 테스트 미흡
- 포커스 관리 테스트 누락
- ARIA 속성 테스트 부족
- `jest-axe` 자동화 테스트 없음

---

## 우수 사례

1. `@/` 절대 경로 사용 컨벤션 준수
2. `userEvent.setup()` 적절히 사용
3. 팩토리 함수 활용 (`createMockAddressSearchResult` 등)
4. 명확한 describe 블록 구조
5. 한국어 테스트 설명 일관성
6. 에지 케이스 테스트 포함

---

## 우선 수정 필요 항목

1. **긴급**: `any` 타입 사용 수정 (InitialSetupModal, UserMenu)
2. **긴급**: `beforeEach` import 누락 수정 (ModalCloseButton)
3. **높음**: mock 초기화 추가
4. **중간**: CSS 클래스 테스트를 동작 테스트로 전환
5. **낮음**: 접근성 테스트 강화
