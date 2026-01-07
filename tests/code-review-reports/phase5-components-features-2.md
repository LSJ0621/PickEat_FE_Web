# Phase 5: Components Features Part 2 코드 리뷰 리포트

## 요약

| 카테고리 | Critical | Warning | Suggestion |
|---------|----------|---------|------------|
| User Setup + Address | 1 | 8 | 6 |
| Preferences + Auth + Bug Report | 1 | 6 | 10 |
| Home + Admin | 2 | 5 | 12 |
| **합계** | **4** | **19** | **28** |

---

## 1. User Setup + Address (Agent 5-A)

### tests/components/features/user/setup/InitialSetupModal.test.tsx

#### Critical
- **[LINE:647]** `any` 타입 사용
  ```typescript
  // 현재
  vi.mocked(userService.getAddresses).mockResolvedValue({...} as any);

  // 권장
  vi.mocked(userService.getAddresses).mockResolvedValue({...} as unknown as ReturnType<typeof userService.getAddresses>);
  ```

#### Warnings
- **[LINE:533-559]** mock 정의 확인만 하는 무의미한 assertion
  ```typescript
  // 무의미함
  expect(mockSetAddress).toBeDefined();
  ```
- **[LINE:563-598]** JavaScript 기본 동작 테스트 (parseFloat 등)
- **[LINE:11-14]** 모듈 레벨 mutable 상태

---

### tests/components/features/user/setup/AddressRegistrationModal.test.tsx

#### Warnings
- **[LINE:196-224]** 좌표 정규화 로직이 프로덕션 코드가 아닌 테스트 복사본 검증
- **[LINE:17]** 모듈 레벨 mutable mock 상태

---

### tests/components/features/user/setup/InitialSetupAddressSection.test.tsx

#### Warnings
- **[LINE:9]** `unknown[]` 대신 구체적 타입 사용 권장
- **[LINE:209-225]** 조건부 실행에서 assertion 누락 - 조용히 통과할 수 있음
  ```typescript
  // 현재
  if (addressButton) {
    await user.click(addressButton);
  }

  // 권장: assertion 추가
  expect(addressButton).not.toBeNull();
  if (addressButton) { ... }
  ```

---

### tests/components/features/user/setup/InitialSetupPreferencesSection.test.tsx

#### Warnings
- **[LINE:213-217, 234-237]** 조건부 실행에서 assertion 누락

---

### tests/components/features/user/address/AddressListModal.test.tsx

#### Warnings
- **[LINE:317-322]** 조건부 클릭에서 요소 존재 assertion 누락

---

## 2. Preferences + Auth + Bug Report (Agent 5-B)

### tests/components/features/user/preferences/PreferencesEditModal.test.tsx

#### Warnings
- **[LINE:219-223, 238-243]** 안전하지 않은 DOM 탐색
  ```typescript
  // 현재 (취약)
  const likeTag = screen.getByText('한식').closest('span');
  const deleteButton = likeTag?.querySelector('button');

  // 권장: Testing Library queries 사용
  const likeTag = screen.getByText('한식');
  const deleteButton = within(likeTag.closest('span')!).getByRole('button');
  ```

---

### tests/components/features/user/preferences/PreferencesSection.test.tsx

#### Warnings
- **[LINE:131]** `container.firstChild` null 체크 없이 타입 캐스팅

---

### tests/components/features/auth/ReRegisterFormSection.test.tsx

#### Warnings
- **[LINE:196-204]** 미사용 변수 `container`

---

### tests/components/features/bug-report/BugReportForm.test.tsx

#### Warnings
- **[LINE:87-88]** 타입 캐스팅 대신 `toBeChecked()` matcher 사용 권장
  ```typescript
  // 현재
  const inquiryRadio = screen.getByLabelText(...) as HTMLInputElement;
  expect(inquiryRadio.checked).toBe(true);

  // 권장
  expect(screen.getByLabelText(...)).toBeChecked();
  ```

---

### tests/components/features/bug-report/ImageUploader.test.tsx

#### Critical
- **[LINE:18]** `URL.createObjectURL` mock 방식 문제
  ```typescript
  // 현재 (문제)
  global.URL.createObjectURL = vi.fn(() => 'mock-url');

  // 권장
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  });
  ```

#### Warnings
- **[LINE:77-82, 291-295, 308-314]** 조건부 실행에서 assertion 누락
- **[LINE:2]** 미사용 import `waitFor`

---

## 3. Home + Admin (Agent 5-C)

### tests/components/features/home/HomeCTA.test.tsx

#### Warnings
- **[LINE:241]** 타이포: `const { container}` → `const { container }`

#### Suggestions
- [LINE:76-78] 네비게이션 테스트가 실제 이동 검증 안함

---

### tests/components/features/admin/bug-reports/BugReportDetailModal.test.tsx

#### Critical
- **[LINE:1]** 미사용 import `afterEach`
  ```typescript
  // 현재
  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

  // 수정
  import { describe, it, expect, vi, beforeEach } from 'vitest';
  ```

#### Warnings
- **[LINE:24-27]** `vi.stubGlobal` 정리 필요 - `afterEach`에서 `vi.unstubAllGlobals()` 호출
- **[LINE:410-414]** 조건부 클릭에서 assertion 누락

---

### tests/components/features/admin/bug-reports/BugReportImageGallery.test.tsx

#### Critical
- **[LINE:70-78]** `as unknown as string[]` 타입 캐스팅 - TypeScript 안전성 우회
  ```typescript
  // 현재 (문제)
  <BugReportImageGallery images={null as unknown as string[]} />

  // 권장: 컴포넌트가 null 허용하면 타입에 반영, 아니면 테스트 제거
  ```

---

### tests/components/features/admin/bug-reports/BugReportList.test.tsx

#### Warnings
- **[LINE:89-95, 105-110, 120-128]** 조건부 버튼 클릭에서 assertion 누락

---

### tests/components/features/admin/bug-reports/BugReportListSkeleton.test.tsx

#### Suggestions
- [LINE:152-168] className 전체 비교 취약 - 특정 클래스만 체크 권장
  ```typescript
  // 취약
  expect(firstItem.className).toBe(lastItem.className);

  // 권장
  expect(firstItem).toHaveClass('animate-pulse', 'rounded-lg');
  ```

---

## 반복되는 패턴 이슈

### 1. 조건부 실행에서 Assertion 누락 (전체 파일)
```typescript
// 문제: 요소 못 찾으면 조용히 통과
if (button) {
  await user.click(button);
  expect(callback).toHaveBeenCalled();
}

// 권장
expect(button).not.toBeNull();
await user.click(button!);
expect(callback).toHaveBeenCalled();
```

영향받는 파일:
- InitialSetupAddressSection.test.tsx
- InitialSetupPreferencesSection.test.tsx
- AddressListModal.test.tsx
- ImageUploader.test.tsx
- BugReportDetailModal.test.tsx
- BugReportList.test.tsx

### 2. 네비게이션 테스트 미완성
버튼 존재만 확인하고 실제 이동 검증 안함:
- HomeCTA.test.tsx
- HomeHero.test.tsx

### 3. 타입 캐스팅 문제
- `as any` 사용: InitialSetupModal.test.tsx
- `as unknown as Type` 사용: BugReportImageGallery.test.tsx

---

## 우수 사례

1. `renderWithProviders` 유틸리티 일관적 사용
2. `@/` 절대 경로 사용 규칙 준수
3. `import type` 올바르게 사용
4. 인증/미인증 상태별 테스트 분리
5. 접근성 테스트 포함
6. 애니메이션 상태 테스트 포함
7. 팩토리 함수 적극 활용 (`createMockEmailVerification` 등)
8. 드래그 앤 드롭 테스트 포함 (ImageUploader)
9. 키보드 네비게이션 테스트 포함

---

## 우선 수정 필요 항목

1. **긴급**: `any` 타입 제거 (InitialSetupModal)
2. **긴급**: 미사용 import 제거 (BugReportDetailModal)
3. **높음**: `URL.createObjectURL` mock 방식 수정 (ImageUploader)
4. **높음**: 조건부 실행에 assertion 추가 (다수 파일)
5. **중간**: 타입 캐스팅을 proper 타입으로 대체
6. **낮음**: 네비게이션 테스트 완성
