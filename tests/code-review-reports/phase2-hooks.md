# Phase 2: Hooks Layer 코드 리뷰 리포트

## 요약

| 카테고리 | Critical | Warning | Suggestion |
|---------|----------|---------|------------|
| Agent + Auth Hooks | 1 | 4 | 8 |
| Address + History Hooks | 2 | 5 | 7 |
| Common + Other Hooks | 7 | 4 | 6 |
| **합계** | **10** | **13** | **21** |

---

## 1. Agent + Auth Hooks (Agent 2-A)

### tests/hooks/agent/useAgentActions.test.tsx

#### Warnings
- **[LINE:14]** `BASE_URL` 하드코딩 - `utils/constants.ts`에서 import 권장
- **[LINE:29]** 변수 선언 패턴 개선 필요 - `beforeEach`에서 직접 초기화 권장

#### Suggestions
- [LINE:96-104] 메모이제이션 테스트 시 의존성 변경 케이스도 추가 권장
- [LINE:162-181] 반환된 레스토랑 데이터 구조 검증 추가 권장

---

### tests/hooks/agent/useConfirmModal.test.tsx

#### Critical
- **[LINE:31]** 상태 구조 불일치
  ```typescript
  // 현재: aiLoadingStates: {}
  // 실제 slice: isAiLoading: boolean, aiLoadingMenu: string | null
  ```

#### Warnings
- [LINE:126-136] `addEventListener` spy가 다른 훅에 의해서도 호출될 수 있음

#### Suggestions
- [LINE:193-219] 새 훅 인스턴스 대신 단일 인스턴스에서 상태 변경 테스트 권장

---

### tests/hooks/auth/useEmailVerification.test.ts

#### Warnings
- **[LINE:2]** 미사용 import: `waitFor`
- **[LINE:36]** `toBe(undefined)` 대신 `toBeUndefined()` 사용 권장

#### Suggestions
- [LINE:110-131] `onReRegister` 에러 throw 시 동작 테스트 추가
- [LINE:910-1067] 동시 `handleEmailAction` 호출 테스트 추가

---

### tests/hooks/auth/useVerificationTimer.test.ts

#### Suggestions
- **[LINE:33-44]** 테스트 설명 언어 일관성 필요 (한국어/영어 혼용)
- [LINE:264-333] 음수 초 입력 테스트 추가 권장

---

## 2. Address + History Hooks (Agent 2-B)

### tests/hooks/address/useAddressModal.test.ts

#### Warnings
- **[LINE:5]** 미사용 import: `useErrorHandler` - mock으로만 사용됨

#### Suggestions
- [LINE:155-157] 반복되는 `act` 패턴을 헬퍼 함수로 추출 권장

---

### tests/hooks/address/useAddressList.test.tsx

#### Warnings
- **[LINE:288-296]** `waitFor` 내부에서 mock 설정 - race condition 가능
  ```typescript
  // 권장: mock 설정은 waitFor 외부에서
  vi.mocked(userService.getAddresses).mockResolvedValue({ addresses: mockAddresses });
  await waitFor(() => { /* assertion만 */ });
  ```
- **[LINE:311-336]** 기본주소 삭제 방지 테스트에서 `loadAddresses` 선행 호출 필요

---

### tests/hooks/address/useAddressSearch.test.ts

#### Warnings
- **[LINE:5]** 미사용 import: `useErrorHandler`

---

### tests/hooks/history/useHistoryMenuActions.test.tsx

#### Warnings
- **[LINE:199-234]** 복잡한 mock 복원 로직 - `vi.doMock`/`vi.doUnmock` 사용 권장
- **[LINE:300-318]** `let` 변수와 `!` 단언 패턴 개선 필요

#### Suggestions
- [LINE:43-53] describe 블록 이름 언어 일관성 필요

---

### tests/hooks/history/useHistoryAiHistory.test.tsx

#### Warnings
- **[LINE:59-65]** `waitFor` 내부에서 `await` 사용 - `act`로 대체 권장
  ```typescript
  // 권장
  await act(async () => {
    await result.current.handleShowAiHistory();
  });
  ```
- **[LINE:201-206, 243-248, 270-278]** `act` 누락 - 상태 업데이트 함수 호출 시 필요

---

### tests/hooks/history/useHistoryAiRecommendations.test.ts

#### Critical
- **[LINE:218, 277, 407-408]** `any` 타입 사용 - CLAUDE.md 규칙 위반
  ```typescript
  // 현재
  config: {} as any,
  name: null as any,

  // 권장
  import type { AxiosRequestConfig } from 'axios';
  config: {} as AxiosRequestConfig,
  ```

#### Warnings
- [LINE:272-297] Promise resolve 캡처 패턴 복잡 - fake timer 사용 권장

---

## 3. Common + Other Hooks (Agent 2-C)

### tests/hooks/common/useToast.test.tsx

#### Suggestions
- [LINE:8-11] 에러 throw 테스트 시 console.error 억제 권장

---

### tests/hooks/common/useLocalStorage.test.ts

#### Warnings
- **[LINE:231-248]** 테스트 이름과 실제 검증 내용 불일치 ("stable setValue function reference")

---

### tests/hooks/common/useDebounce.test.ts

#### Suggestions
- [LINE:96-159] `it.each`를 사용한 파라미터화 테스트로 통합 권장

---

### tests/hooks/common/usePrevious.test.ts

#### Critical
- **[LINE:74]** `any` 타입 사용
  ```typescript
  // 현재: null as any
  // 권장: null as string | null | undefined
  ```

---

### tests/hooks/common/useModalScrollLock.test.ts

#### Warnings
- [LINE:160-177] 구현 세부사항 테스트 - 의도된 동작인지 확인 필요

#### Suggestions
- [LINE:113-142] 다중 모달 인스턴스 제한사항 문서화 권장

---

### tests/hooks/map/useUserLocation.test.ts

#### Critical
- **[LINE:99]** `any` 타입 사용
  ```typescript
  // 현재: const mockUser: any = {...}
  // 권장: as Partial<User>
  ```

---

### tests/hooks/place/usePlaceDetails.test.ts

#### Warnings
- **[LINE:52-69]** `let resolvePlace!:` 패턴 개선 필요
- **[LINE:257, 284]** `setTimeout` 대기 패턴 - `waitFor` 또는 fake timer 사용 권장

---

### tests/hooks/user/usePreferences.test.tsx

#### Critical (5개 모두 동일 이슈)
- **[LINE:71-73, 594-596, 612-614, 630-632, 648-650]** `waitFor` 미await - 테스트 신뢰성 문제
  ```typescript
  // 현재 (버그)
  rerender({ initialLikes: ['한식', '중식'] });
  waitFor(() => {
    expect(result.current.likes).toEqual(['한식', '중식']);
  });

  // 수정
  rerender({ initialLikes: ['한식', '중식'] });
  await waitFor(() => {
    expect(result.current.likes).toEqual(['한식', '중식']);
  });
  ```

---

### tests/hooks/useErrorHandler.test.tsx

#### Warnings
- **[LINE:3]** 미사용 import: `ErrorType`

#### Suggestions
- 503 (Service Unavailable), 403 (Forbidden) 상태 코드 테스트 추가 권장

---

## 반복되는 패턴 이슈

### 1. `any` 타입 사용 (Critical)
영향받는 파일:
- useHistoryAiRecommendations.test.ts (3곳)
- usePrevious.test.ts (1곳)
- useUserLocation.test.ts (1곳)

### 2. `waitFor` 사용 패턴 오류
- `await` 누락: usePreferences.test.tsx (5곳)
- 내부에서 mock 설정: useAddressList.test.tsx
- 내부에서 `await` 사용: useHistoryAiHistory.test.tsx

### 3. 미사용 import
- waitFor: useEmailVerification.test.ts
- ErrorType: useErrorHandler.test.tsx
- useErrorHandler: useAddressModal.test.ts, useAddressSearch.test.ts

### 4. 테스트 언어 일관성
- 한국어/영어 혼용된 describe/it 블록들

---

## 우수 사례

1. `renderHook` 및 `act` 적절히 사용
2. 비동기 훅 상태 변화 테스트 포함
3. cleanup 및 unmount 테스트 포함
4. 메모이제이션 안정성 테스트 포함
5. 이벤트 리스너 정리 테스트 포함
6. 팩토리 함수 활용
7. 로딩 상태 테스트 포함

---

## 우선 수정 필요 항목

1. **긴급**: usePreferences.test.tsx의 5개 미await `waitFor` 수정
2. **높음**: 모든 `any` 타입을 적절한 타입으로 교체
3. **중간**: 미사용 import 제거
4. **낮음**: 테스트 언어 일관성 통일
