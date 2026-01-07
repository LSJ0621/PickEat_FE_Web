# Phase 1: Core Infrastructure 코드 리뷰 리포트

## 요약

| 카테고리 | Critical | Warning | Suggestion |
|---------|----------|---------|------------|
| API Tests | 3 | 8 | 5 |
| Store Tests | 2 | 4 | 4 |
| Utils + Types | 1 | 3 | 8 |
| **합계** | **6** | **15** | **17** |

---

## 1. API Tests (Agent 1-A)

### tests/api/client.test.ts

#### Warnings
- **[LINE:112-114, 170-174]** 빈 catch 블록에 적절한 assertion 없음
  ```typescript
  // 현재 코드
  } catch (error) {
    // Expected to fail
  }

  // 권장 수정
  await expect(apiClient.get(ENDPOINTS.AUTH.ME)).rejects.toThrow();
  ```

- **[LINE:271-280]** `handle error responses correctly` 테스트에 서버 핸들러 설정 없음

#### Suggestions
- **[LINE:12]** `BASE_URL` 하드코딩 - 공유 상수 파일 고려

---

### tests/api/services/auth.test.ts

#### Critical
- **[LINE:10-11]** apiClient 중복 import
  ```typescript
  // 수정 필요
  import { apiClient } from '@/api/client';
  import apiClientDefault from '@/api/client'; // 제거
  ```

#### Warnings
- **[LINE:60-66, 83-89, 117-123 등]** try/catch 패턴에서 `expect(error).toBeDefined()` 만 사용
  ```typescript
  // 권장 수정
  await expect(authService.sendEmailVerificationCode('invalid@example.com', 'SIGNUP')).rejects.toBeDefined();
  ```

- **[LINE:125-136]** 삭제된 계정 로그인 테스트에서 `canReRegister` 필드 검증 누락

---

### tests/api/services/user.test.ts

#### Warnings
- **[LINE:36-42, 367-373, 401-416, 444-458]** try/catch 패턴 이슈

#### Positives
- [LINE:151-158] `hasPlaceRecommendations` 필드 정규화 엣지 케이스 테스트 우수
- [LINE:160-218] API 응답 필드명 변형(camelCase/snake_case) 처리 테스트 우수

---

### tests/api/services/menu.test.ts

#### Warnings
- **[LINE:50-56, 68-73 등]** try/catch 패턴 이슈
- **[LINE:23-29]** `beforeEach`에서 토큰 설정 누락

---

### tests/api/services/search.test.ts

#### Critical
- **[LINE:72]** 필드명 불일치: 테스트는 `menu` 사용, 핸들러는 `menuName` 기대
  ```typescript
  // 실제 API 필드명 확인 필요
  ```

#### Warnings
- **[LINE:119-128, 130-148, 151-169, 188-204]** try/catch 패턴 이슈
- **[LINE:16-23]** 인증 토큰 설정 누락

---

### tests/api/services/bug-report.test.ts

#### Critical
- **[LINE:11,164,186,300,329 등]** 타입 불일치: 테스트는 `'UNCONFIRMED'` | `'CONFIRMED'` 사용, 모의 핸들러는 `'PENDING'` | `'IN_PROGRESS'` | `'RESOLVED'` | `'CLOSED'` 정의
- **[LINE:33]** `result.message` 접근하지만 `CreateBugReportResponse` 타입에는 `id`만 존재

#### Warnings
- **[LINE:87-93, 105-116 등]** try/catch 패턴 이슈
- **[LINE:143-151]** "with default parameters" 설명이지만 빈 객체 전달

---

## 2. Store Tests (Agent 1-B)

### tests/store/slices/authSlice.test.ts

#### Critical
- **[LINE:28-41]** `mockUser.preferences` 타입 불일치
  ```typescript
  // 현재: spicy, sweet, salty, sour 사용
  // 실제 타입: likes: string[], dislikes: string[], analysis?: string | null
  ```

- **[LINE:70-75]** 의미 없는 테스트
  ```typescript
  expect(true).toBe(true); // 실제 검증 없음
  ```

#### Warnings
- **[LINE:22]** `BASE_URL` 하드코딩
- **[LINE:94-95]** `delete` 연산자 대신 구조 분해 사용 권장
  ```typescript
  const { role, ...userWithoutRole } = mockUser;
  ```
- **[LINE:222-241]** `newPreferences` 타입 불일치

#### Suggestions
- 셀렉터(selector) 테스트 누락
- [LINE:458-473] 비동기 타이밍 문제 가능성

---

### tests/store/slices/agentSlice.test.ts

#### Warnings
- **[LINE:43-45]** 빈 `beforeEach` 훅 - 삭제 또는 실제 코드 추가
- **[LINE:161-173]** `Restaurant` mock 데이터 불완전

#### Suggestions
- 셀렉터 테스트 누락
- [LINE:285-375] 빈 menuName 엣지 케이스 테스트 추가 권장
- `PlaceRecommendationItem`의 선택적 필드 테스트 추가 권장

---

## 3. Utils + Types Tests (Agent 1-C)

### tests/utils/naverMap.test.ts

#### Critical
- **[LINE:7,16,25,40]** `as any` 타입 사용 - 프로젝트 컨벤션 위반
  ```typescript
  // 권장: 적절한 mock 타입 생성
  interface MockBounds {
    getNE: () => { lat: () => number; lng: () => number };
    getSW: () => { lat: () => number; lng: () => number };
  }
  ```

---

### tests/utils/format.test.ts

#### Warnings
- **[LINE:100-103]** 주석과 테스트 기대값 불일치

---

### tests/utils/constants.test.ts

#### Warnings
- **[LINE:21-24]** 불변성 테스트가 실질적 가치 없음
- **[LINE:26-28]** 키 순서 assertion이 취약함

---

### tests/types/auth.test.ts & user.test.ts

#### Warnings
- 중복 테스트 로직 존재
- `SetAddressResponse`와 `UserAddress`간 날짜 타입 불일치 (Date vs string)

#### Suggestions
- vitest의 `expectTypeOf` 사용 고려

---

## 반복되는 패턴 이슈

### 1. try/catch 패턴 (전체 API 테스트에서 발생)
```typescript
// 현재 패턴 - 에러 미발생시 테스트 통과됨
try {
  await someApiCall();
} catch (error) {
  expect(error).toBeDefined();
}

// 권장 패턴
await expect(someApiCall()).rejects.toBeDefined();
```

### 2. 하드코딩된 BASE_URL
`tests/utils/constants.ts` 파일 생성하여 테스트 상수 통합 관리 권장

### 3. 인증 토큰 설정 누락
`beforeEach`에서 토큰 설정 필요한 테스트 파일들:
- menu.test.ts
- search.test.ts

---

## 우수 사례

1. `@/` 절대 경로 사용 컨벤션 준수
2. `import type` 사용 컨벤션 준수
3. MSW를 활용한 API 모킹 적절히 구현
4. 테스트 격리를 위한 `beforeEach` cleanup 적용
5. 필드명 변형 처리 테스트 (user.test.ts)
6. XSS 살균 테스트 (naverMap.test.ts)
