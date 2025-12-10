# UI/UX 및 유지보수성 개선 계획

## 📊 현재 문제점 분석

### 1. UI/UX 문제점

#### 1.1 모달 자동 닫힘 문제
**발견 위치**: 
- `src/pages/Agent.tsx` (314-371줄) - 확인 카드 모달
- `src/components/features/history/HistoryItem.tsx` (확인 카드 모달)

**문제점**:
- AI 추천 또는 일반 검색 버튼 클릭 후 모달이 자동으로 닫히지 않음
- 사용자가 수동으로 닫기 버튼을 클릭해야 함
- 선택 후 즉시 피드백이 없어 사용자 경험 저하

**현재 코드 분석**:
```typescript
// Agent.tsx
const handleSearch = async () => {
  // 검색 로직 실행
  // 하지만 showConfirmCard를 false로 설정하지 않음
};

const handleAiRecommendation = async () => {
  // AI 추천 로직 실행
  // 하지만 showConfirmCard를 false로 설정하지 않음
};
```

**예상 사용자 시나리오**:
1. 사용자가 메뉴 클릭 → 확인 카드 모달 표시
2. "일반 검색" 또는 "AI 추천 보기" 버튼 클릭
3. 모달이 열린 상태로 검색 결과 표시
4. 사용자가 수동으로 X 버튼 클릭해야 모달 닫힘

#### 1.2 모달 상태 관리 일관성 부족
**문제점**:
- `Agent.tsx`와 `HistoryItem.tsx`에서 모달 닫기 로직이 다름
- `Agent.tsx`: `handleSearch`와 `handleAiRecommendation`에서 모달 닫기 구현됨
- `HistoryItem.tsx`: `handleAiRecommendWithClose`에서는 모달 닫지만, `handleSearchWithClose`에서는 모달을 닫지 않음

#### 1.3 모달 외부 클릭으로 닫기 미지원
**문제점**:
- 배경 클릭으로 모달을 닫을 수 없음
- ESC 키로 닫기 미지원

#### 1.4 alert() 과다 사용 (77개 발견)
**문제점**:
- 브라우저 기본 `alert()` 사용이 많음 (20개 파일에서 77개 발견)
- 사용자 경험이 좋지 않음 (차단적, 스타일링 불가)
- 일관성 없는 에러 처리 방식

**발견 위치**:
- `src/pages/Agent.tsx` (11개)
- `src/hooks/useHistoryMenuActions.ts` (3개)
- `src/hooks/useHistoryAiRecommendations.ts` (7개)
- 기타 여러 파일

**개선 방안**:
- Toast/Snackbar 컴포넌트로 교체
- 에러 메시지를 UI 내부에 표시
- 성공/실패 피드백을 일관되게 처리

#### 1.5 에러 처리 방식 불일치
**문제점**:
- 일부는 `alert()` 사용
- 일부는 에러 메시지를 UI에 표시
- 일부는 조용히 실패 처리
- 사용자가 에러 상황을 파악하기 어려움

**현재 에러 처리 패턴**:
1. **alert() 사용** (77개 발견)
   - `src/pages/Agent.tsx` (11개)
   - `src/hooks/useHistoryMenuActions.ts` (3개)
   - `src/hooks/useHistoryAiRecommendations.ts` (7개)
   - `src/components/features/menu/MenuSelectionModal.tsx` (4개)
   - 기타 여러 파일

2. **UI에 에러 메시지 표시**
   - 일부 페이지에서 `error` state로 관리
   - 일부 컴포넌트에서 인라인 에러 표시

3. **조용히 실패**
   - try-catch에서 에러를 잡지만 사용자에게 알리지 않음
   - 로그만 남기고 UI 피드백 없음

**기존 유틸리티**:
- `src/utils/error.ts`의 `extractErrorMessage` 함수 존재
- Axios 에러 타입 가드 (`isAxiosError`) 사용

#### 1.6 가게 상세정보 모달 레이아웃 문제
**발견 위치**: `src/components/features/restaurant/PlaceDetailsModal.tsx`

**문제점**:
1. **모달 상단 가려짐 문제**
   - 브라우저 크기를 줄였을 때 모달 상단이 브라우저 상단에 가려짐
   - `items-center`로 중앙 정렬되어 있어 화면이 작을 때 상단이 보이지 않음
   - 닫기 버튼이 가려져서 모달을 닫을 수 없는 상황 발생

2. **스크롤 문제**
   - 스크롤을 올려도 맨 위로 가지 않음
   - 모달 자체에 `max-height`가 없어서 화면이 작을 때 문제 발생
   - 내부 div에만 `max-h-[80vh]`가 적용되어 모달 전체가 스크롤되지 않음

3. **스크롤바 UI 문제**
   - 스크롤바 길이가 너무 길어서 보기 좋지 않음
   - `custom-scroll` 클래스가 적용되어 있지만 스크롤바 스타일 개선 필요

**현재 코드 분석**:
```typescript
// PlaceDetailsModal.tsx (56-73줄)
<div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur">
  <div className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl">
    {/* 닫기 버튼 */}
    <ModalCloseButton onClose={onClose} />
    
    {/* 콘텐츠 */}
    <div className="max-h-[80vh] overflow-y-auto rounded-xl custom-scroll space-y-6">
      {/* 내용 */}
    </div>
  </div>
</div>
```

**개선 방안**:
1. 모달을 `items-start`로 변경하고 `py-4` 또는 `py-8` 추가하여 상단 여백 확보
2. 모달 자체에 `max-h-[90vh]` 또는 `max-h-[calc(100vh-2rem)]` 적용
3. 모달을 항상 상단에서 접근 가능하도록 `overflow-y-auto` 적용
4. 스크롤바 스타일 개선 (더 짧고 세련되게)
5. 모달 열릴 때 스크롤 위치를 맨 위로 초기화

### 2. 유지보수성 문제점

#### 2.1 Pages 폴더 구조 문제
**현재 구조**:
```
src/pages/
├── Agent.tsx
├── Home.tsx
├── Login.tsx
├── Map.tsx
├── MenuSelectionHistory.tsx
├── MyPage.tsx
├── OAuthGoogleRedirect.tsx
├── OAuthKakaoRedirect.tsx
├── PasswordReset.tsx
├── PasswordResetRequest.tsx
├── RecommendationHistory.tsx
├── Register.tsx
└── ReRegister.tsx
```

**문제점**:
- 모든 페이지가 평면적으로 나열됨
- 인증 관련 페이지들이 분산됨 (Login, Register, ReRegister, PasswordReset 등)
- 이력 관련 페이지들이 분산됨 (MenuSelectionHistory, RecommendationHistory)
- OAuth 리다이렉트 페이지들이 분산됨
- 기능별로 그룹화되지 않아 찾기 어려움

**개선된 구조**:
```
src/pages/
├── auth/                    # 인증 관련
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ReRegister.tsx
│   ├── PasswordReset.tsx
│   ├── PasswordResetRequest.tsx
│   └── oauth/              # OAuth 리다이렉트
│       ├── OAuthKakaoRedirect.tsx
│       └── OAuthGoogleRedirect.tsx
├── history/                 # 이력 관련
│   ├── MenuSelectionHistory.tsx
│   └── RecommendationHistory.tsx
├── main/                    # 메인 기능
│   ├── Home.tsx
│   ├── Agent.tsx
│   └── Map.tsx
└── user/                    # 사용자 관련
    └── MyPage.tsx
```

#### 2.2 Hooks 폴더 구조 문제
**현재 구조**:
```
src/hooks/
├── useAddressList.ts
├── useAddressModal.ts
├── useAddressSearch.ts
├── useDebounce.ts
├── useEmailVerification.ts
├── useHistoryAiHistory.ts
├── useHistoryAiRecommendations.ts
├── useHistoryMenuActions.ts
├── useLocalStorage.ts
├── useModalScrollLock.ts
├── useNaverMap.ts
├── usePlaceDetails.ts
├── usePreferences.ts
└── useUserLocation.ts
```

**문제점**:
- 모든 Hook이 평면적으로 나열됨
- 관련 Hook들이 분산됨 (주소 관련, 이력 관련, 인증 관련)
- 공통 Hook과 도메인별 Hook이 구분되지 않음

**개선된 구조**:
```
src/hooks/
├── common/                  # 공통 Hook
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useModalScrollLock.ts
├── auth/                    # 인증 관련
│   └── useEmailVerification.ts
├── address/                 # 주소 관련
│   ├── useAddressList.ts
│   ├── useAddressModal.ts
│   └── useAddressSearch.ts
├── history/                 # 이력 관련
│   ├── useHistoryAiHistory.ts
│   ├── useHistoryAiRecommendations.ts
│   └── useHistoryMenuActions.ts
├── map/                     # 지도 관련
│   ├── useNaverMap.ts
│   └── useUserLocation.ts
├── place/                   # 장소 관련
│   └── usePlaceDetails.ts
└── user/                    # 사용자 관련
    └── usePreferences.ts
```

#### 2.3 컴포넌트 재사용성 문제
**문제점**:
- `Agent.tsx`와 `HistoryItem.tsx`에 거의 동일한 확인 카드 모달 코드 중복
- 모달 UI가 두 곳에 하드코딩되어 있음
- 수정 시 두 곳 모두 수정해야 함

---

## 🎯 개선 목표

1. **UI/UX 개선**: 모달 자동 닫힘, 키보드 지원
2. **유지보수성 향상**: 기능별 폴더 구조로 재구성
3. **일관성 확보**: 동일한 기능은 동일한 패턴으로 구현

---

## 📋 단계별 개선 계획

### Phase 1: UI/UX 개선 (우선순위 높음)

#### 1.1 확인 카드 모달 자동 닫힘 구현
**대상 파일**:
- `src/components/features/history/HistoryItem.tsx` (주요 문제)
- `src/pages/Agent.tsx` (이미 구현됨, 확인 필요)

**현재 상태**:
- `Agent.tsx`: 이미 모달 자동 닫힘 구현됨 (123줄, 211줄)
- `HistoryItem.tsx`: `handleSearchWithClose`에서 모달을 닫지 않음

**작업 내용**:
1. `HistoryItem.tsx`의 `handleSearchWithClose`에서 모달 닫기 추가
2. `useHistoryMenuActions`의 `handleSearch`는 이미 모달을 닫지만, 확인 필요

**예상 코드 변경**:
```typescript
// HistoryItem.tsx
const handleSearchWithClose = async () => {
  await menuActions.handleSearch();
  menuActions.handleCancel(); // 모달 닫기 추가
};
```

#### 1.2 모달 외부 클릭/ESC 키 지원
**작업 내용**:
1. 배경 클릭 시 모달 닫기
2. ESC 키 입력 시 모달 닫기
3. `useEffect`로 ESC 키 리스너 추가

#### 1.3 가게 상세정보 모달 레이아웃 개선
**대상 파일**: `src/components/features/restaurant/PlaceDetailsModal.tsx`

**작업 내용**:
1. 모달 위치 조정
   - `items-center` → `items-start` 변경
   - `py-4` 또는 `py-8` 추가하여 상단 여백 확보
   - 모달이 항상 상단에서 접근 가능하도록 보장

2. 모달 크기 제한
   - 모달 자체에 `max-h-[90vh]` 또는 `max-h-[calc(100vh-2rem)]` 적용
   - 내부 콘텐츠 div의 `max-h-[80vh]` 제거 또는 조정
   - 모달 전체가 스크롤 가능하도록 변경

3. 스크롤 초기화
   - 모달이 열릴 때 스크롤 위치를 맨 위로 초기화
   - `useEffect`로 `placeId` 변경 시 스크롤 리셋

4. 스크롤바 스타일 개선
   - `custom-scroll` 클래스 스타일 개선
   - 스크롤바 길이를 더 짧고 세련되게 조정
   - 스크롤바 색상과 투명도 조정

5. createPortal 적용
   - `createPortal`을 사용하여 body에 직접 렌더링
   - 헤더/푸터를 가리도록 일관성 확보

**예상 코드 변경**:
```typescript
// PlaceDetailsModal.tsx
return createPortal(
  <div className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/70 p-4 pt-8 backdrop-blur overflow-y-auto">
    <div className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-[32px] border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl overflow-y-auto custom-scroll">
      <ModalCloseButton onClose={onClose} />
      {/* 콘텐츠 */}
    </div>
  </div>,
  document.body
);
```

#### 1.4 모든 모달에 createPortal 적용 (일관성 개선)
**목적**: 모든 모달이 헤더/푸터를 가리도록 일관성 확보

**대상 파일** (총 8개):
1. `src/components/common/AuthPromptModal.tsx` - 로그인 프롬프트 모달
2. `src/components/common/InitialSetupModal.tsx` - 초기 설정 모달
3. `src/components/common/AddressRegistrationModal.tsx` - 주소 등록 모달
4. `src/components/features/menu/MenuSelectionModal.tsx` - 메뉴 선택 모달
5. `src/components/features/menu/MenuSelectionEditModal.tsx` - 메뉴 선택 수정 모달
6. `src/components/features/user/preferences/PreferencesEditModal.tsx` - 취향 편집 모달
7. `src/components/features/user/address/AddressListModal.tsx` - 주소 목록 모달
8. `src/components/features/user/address/AddressAddModal.tsx` - 주소 추가 모달

**작업 내용**:
1. 각 모달에 `createPortal` import 추가
2. 모달 JSX를 `createPortal(..., document.body)`로 감싸기
3. 빌드 및 기능 테스트

**예상 코드 변경 패턴**:
```typescript
// 변경 전
return (
  <div className="fixed inset-0 z-50 ...">
    {/* 모달 내용 */}
  </div>
);

// 변경 후
import { createPortal } from 'react-dom';

return createPortal(
  <div className="fixed inset-0 z-50 ...">
    {/* 모달 내용 */}
  </div>,
  document.body
);
```

**장점**:
- 모든 모달이 헤더/푸터를 가리도록 일관성 확보
- z-index 문제 감소
- 사용자 경험 일관성 향상

#### 1.5 에러 처리 방식 통일 계획
**목적**: 모든 에러를 일관된 방식으로 처리하여 사용자 경험 향상

**현재 문제점**:
- `alert()` 사용 (77개 발견) - 차단적, 스타일링 불가
- 에러 메시지 표시 방식 불일치 (일부는 UI, 일부는 alert)
- 조용히 실패하는 경우 존재
- 사용자가 에러 상황을 파악하기 어려움

**1단계: Toast/Snackbar 컴포넌트 생성**
- `src/components/common/Toast.tsx` 생성
- 성공/에러/경고/정보 타입 지원
- 자동 사라짐 (기본 3초, 설정 가능)
- 수동 닫기 버튼 지원
- 여러 Toast 동시 표시 지원 (스택 방식)
- Toast Provider 생성 및 App에 추가
- `useToast` Hook 생성

**2단계: 에러 처리 Hook 생성**
- `src/hooks/useErrorHandler.ts` 생성
- `extractErrorMessage` 활용
- 에러 타입별 처리 로직
- 개발 환경에서만 콘솔 로그

**에러 타입별 처리 방식**:
```typescript
// 에러 타입 정의
enum ErrorType {
  VALIDATION = 'validation',      // 검증 에러 (400) - 입력 필드에 인라인 표시 + Toast
  NETWORK = 'network',            // 네트워크 에러 - Toast + 재시도 버튼
  SERVER = 'server',              // 서버 에러 (500, 503) - Toast + "잠시 후 다시 시도"
  AUTH = 'auth',                  // 인증 에러 (401, 403) - Toast + 로그인 페이지 리다이렉트
  NOT_FOUND = 'not_found',        // 리소스 없음 (404) - Toast + 폴백 UI
  UNKNOWN = 'unknown'             // 알 수 없는 에러 - Toast
}

// useErrorHandler Hook 예시
export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, context?: string) => {
    const message = extractErrorMessage(error, '오류가 발생했습니다.');
    const type = getErrorType(error);
    
    toast.error(message, {
      duration: type === ErrorType.VALIDATION ? 4000 : 5000,
    });
    
    if (import.meta.env.DEV) {
      console.error(`[${context || 'Error'}]`, error);
    }
  }, []);

  const handleSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  return { handleError, handleSuccess };
};
```

**3단계: alert() 교체 전략 (우선순위별)**
1. **우선순위 높음** (사용자 액션 직후 에러, 25개)
   - `src/pages/Agent.tsx` (11개)
   - `src/hooks/useHistoryMenuActions.ts` (3개)
   - `src/hooks/useHistoryAiRecommendations.ts` (7개)
   - `src/components/features/menu/MenuSelectionModal.tsx` (4개)

2. **우선순위 중간** (폼 제출 에러)
   - `src/components/common/AddressRegistrationModal.tsx` (2개)
   - `src/components/common/InitialSetupModal.tsx`
   - `src/components/features/menu/MenuSelectionEditModal.tsx` (3개)
   - `src/pages/Register.tsx` (2개)
   - `src/pages/Login.tsx`

3. **우선순위 낮음** (기타)
   - 나머지 파일들

**교체 패턴**:
```typescript
// 변경 전
try {
  await someAction();
  alert('성공했습니다.');
} catch (error) {
  alert(extractErrorMessage(error, '실패했습니다.'));
}

// 변경 후
const { handleError, handleSuccess } = useErrorHandler();

try {
  await someAction();
  handleSuccess('성공했습니다.');
} catch (error) {
  handleError(error, 'someAction');
}
```

**4단계: 성공 메시지도 Toast로 통일**
- 모든 `alert('성공했습니다.')` → `toast.success('성공했습니다.')`
- 일관된 피드백 경험 제공

**체크리스트**:
- [x] `HistoryItem.tsx`에서 모달 자동 닫힘 구현 (handleSearchWithClose 수정) (완료)
- [x] 배경 클릭/ESC 키 지원 (완료)
- [x] **가게 상세정보 모달 레이아웃 개선** (우선순위 높음) (완료)
  - [x] 모달 위치 조정 (items-start, 상단 여백) (완료)
  - [x] 모달 크기 제한 (max-h 적용) (완료)
  - [x] 스크롤 초기화 (모달 열릴 때 맨 위로) (완료)
  - [x] 스크롤바 스타일 개선 (완료)
  - [x] createPortal 적용 (완료)
- [x] **모든 모달에 createPortal 적용** (일관성 개선) (완료)
  - [x] AuthPromptModal.tsx
  - [x] InitialSetupModal.tsx
  - [x] AddressRegistrationModal.tsx
  - [x] MenuSelectionModal.tsx
  - [x] MenuSelectionEditModal.tsx
  - [x] PreferencesEditModal.tsx
  - [x] AddressListModal.tsx
  - [x] AddressAddModal.tsx
- [x] Toast/Snackbar 컴포넌트 생성 (완료)
- [x] alert() 교체 (우선순위: 높은 것부터) (완료)
- [x] 에러 처리 방식 통일 (완료)
- [x] 기능 테스트 완료 (완료)

---

### Phase 2: Pages 폴더 구조 개선

#### 2.1 폴더 구조 생성
**작업 순서**:
1. `src/pages/auth/` 폴더 생성
2. `src/pages/auth/oauth/` 폴더 생성
3. `src/pages/history/` 폴더 생성
4. `src/pages/main/` 폴더 생성
5. `src/pages/user/` 폴더 생성

#### 2.2 파일 이동
**인증 관련**:
- `Login.tsx` → `pages/auth/Login.tsx`
- `Register.tsx` → `pages/auth/Register.tsx`
- `ReRegister.tsx` → `pages/auth/ReRegister.tsx`
- `PasswordReset.tsx` → `pages/auth/PasswordReset.tsx`
- `PasswordResetRequest.tsx` → `pages/auth/PasswordResetRequest.tsx`
- `OAuthKakaoRedirect.tsx` → `pages/auth/oauth/OAuthKakaoRedirect.tsx`
- `OAuthGoogleRedirect.tsx` → `pages/auth/oauth/OAuthGoogleRedirect.tsx`

**이력 관련**:
- `MenuSelectionHistory.tsx` → `pages/history/MenuSelectionHistory.tsx`
- `RecommendationHistory.tsx` → `pages/history/RecommendationHistory.tsx`

**메인 기능**:
- `Home.tsx` → `pages/main/Home.tsx`
- `Agent.tsx` → `pages/main/Agent.tsx`
- `Map.tsx` → `pages/main/Map.tsx`

**사용자 관련**:
- `MyPage.tsx` → `pages/user/MyPage.tsx`

#### 2.3 라우트 경로 업데이트
**작업 내용**:
1. `src/routes/index.tsx`에서 import 경로 수정
2. 라우트 경로는 기존과 동일하게 유지 (사용자 영향 없음)

**체크리스트**:
- [x] 폴더 구조 생성 (완료)
- [x] 파일 이동 (완료)
- [x] 라우트 import 경로 수정 (완료)
- [x] 빌드 성공 확인 (완료)
- [x] 모든 페이지 기능 테스트 완료 (완료)

---

### Phase 3: Hooks 폴더 구조 개선

#### 3.1 폴더 구조 생성
**작업 순서**:
1. `src/hooks/common/` 폴더 생성
2. `src/hooks/auth/` 폴더 생성
3. `src/hooks/address/` 폴더 생성
4. `src/hooks/history/` 폴더 생성
5. `src/hooks/map/` 폴더 생성
6. `src/hooks/place/` 폴더 생성
7. `src/hooks/user/` 폴더 생성

#### 3.2 파일 이동
**공통 Hook**:
- `useDebounce.ts` → `hooks/common/useDebounce.ts`
- `useLocalStorage.ts` → `hooks/common/useLocalStorage.ts`
- `useModalScrollLock.ts` → `hooks/common/useModalScrollLock.ts`

**인증 관련**:
- `useEmailVerification.ts` → `hooks/auth/useEmailVerification.ts`

**주소 관련**:
- `useAddressList.ts` → `hooks/address/useAddressList.ts`
- `useAddressModal.ts` → `hooks/address/useAddressModal.ts`
- `useAddressSearch.ts` → `hooks/address/useAddressSearch.ts`

**이력 관련**:
- `useHistoryAiHistory.ts` → `hooks/history/useHistoryAiHistory.ts`
- `useHistoryAiRecommendations.ts` → `hooks/history/useHistoryAiRecommendations.ts`
- `useHistoryMenuActions.ts` → `hooks/history/useHistoryMenuActions.ts`

**지도 관련**:
- `useNaverMap.ts` → `hooks/map/useNaverMap.ts`
- `useUserLocation.ts` → `hooks/map/useUserLocation.ts`

**장소 관련**:
- `usePlaceDetails.ts` → `hooks/place/usePlaceDetails.ts`

**사용자 관련**:
- `usePreferences.ts` → `hooks/user/usePreferences.ts`

#### 3.3 Import 경로 업데이트
**작업 내용**:
1. 모든 파일에서 Hook import 경로 수정
2. `@/hooks/useXxx` → `@/hooks/domain/useXxx` 형식으로 변경

**체크리스트**:
- [x] 폴더 구조 생성 (완료)
- [x] 파일 이동 (완료)
- [x] 모든 import 경로 수정 (완료)
- [x] 빌드 성공 확인 (완료)
- [x] 기능 테스트 완료 (완료)

---

### Phase 4: 애니메이션 추가

#### 4.1 모달 애니메이션
**작업 내용**:
1. 모달 열림/닫힘 애니메이션 추가
2. 부드러운 페이드 인/아웃 효과
3. 스케일 애니메이션 (선택적)

---

### Phase 5: 홈화면 재디자인

#### 5.1 현재 문제점
**발견 위치**: `src/pages/main/Home.tsx`

**문제점**:
- 단조로운 레이아웃으로 실제 서비스처럼 보이지 않음
- 애니메이션 효과 부족
- 스크롤 시 인터랙티브한 요소 없음
- 서비스 소개가 정적으로만 표시됨
- 사용자 경험이 평면적임

**개선 목표**:
- 현대적인 랜딩 페이지 스타일 적용
- 스크롤 기반 인터랙티브 섹션 구성
- 부드러운 애니메이션 효과 추가
- 서비스 핵심 기능을 시각적으로 강조

#### 5.2 새로운 홈화면 구조

**섹션 구성**:
1. **히어로 섹션 (Hero Section)**
   - 대형 타이틀과 서브타이틀
   - CTA 버튼 (로그인/시작하기)
   - 배경 그라데이션 애니메이션
   - 스크롤 인디케이터

2. **서비스 소개 섹션 (Features Section)**
   - 스크롤 시 각 기능 카드가 순차적으로 나타남 (fade-in, slide-up)
   - 아이콘과 설명이 함께 표시
   - 호버 시 확대 효과

3. **작동 방식 섹션 (How It Works)**
   - 단계별 프로세스 시각화
   - 스크롤 시 각 단계가 순차적으로 강조
   - 애니메이션으로 흐름 표현

4. **주요 기능 하이라이트**
   - AI 추천 기능 강조
   - 지도 기반 검색 기능 소개
   - 개인화된 추천 시스템 설명
   - 각 섹션이 스크롤 시 나타남

5. **사용자 후기/통계 섹션 (선택적)**
   - 숫자 카운트업 애니메이션
   - 사용자 만족도 표시

6. **최종 CTA 섹션**
   - 회원가입 유도
   - 소셜 로그인 버튼

#### 5.3 애니메이션 효과

**스크롤 기반 애니메이션**:
- **Intersection Observer API** 활용
- 요소가 뷰포트에 진입할 때 애니메이션 트리거
- Fade-in, Slide-up, Scale 효과 조합

**애니메이션 타입**:
1. **Fade-in**: 투명도 0 → 1
2. **Slide-up**: 아래에서 위로 이동
3. **Scale**: 작은 크기에서 정상 크기로
4. **Parallax**: 배경 요소의 느린 이동 효과

**성능 최적화**:
- CSS Transform 사용 (GPU 가속)
- `will-change` 속성 활용
- 애니메이션 duration 최적화 (200-500ms)

#### 5.4 기술 스택

**필요한 라이브러리/기술**:
- **Framer Motion** 또는 **React Spring** (선택적, CSS만으로도 가능)
- **Intersection Observer API** (네이티브)
- **Tailwind CSS** 애니메이션 클래스 활용

**구현 방식**:
- 커스텀 Hook: `useScrollAnimation` 생성
- 각 섹션을 독립적인 컴포넌트로 분리
- 재사용 가능한 애니메이션 컴포넌트 생성

#### 5.5 디자인 컨셉

**색상 및 스타일**:
- 기존 다크 테마 유지 (slate-950 배경)
- 그라데이션 강조 (orange-rose-fuchsia)
- 글래스모피즘 효과 (backdrop-blur)
- 부드러운 그림자 효과

**레이아웃**:
- 섹션별 최소 높이: 100vh (뷰포트 높이)
- 중앙 정렬 콘텐츠
- 반응형 디자인 (모바일/태블릿/데스크톱)

**타이포그래피**:
- 큰 제목: 3xl ~ 5xl
- 섹션 제목: 2xl ~ 3xl
- 본문: base ~ lg

#### 5.6 작업 순서

1. **컴포넌트 구조 설계**
   - `HomeHero.tsx` - 히어로 섹션
   - `HomeFeatures.tsx` - 기능 소개
   - `HomeHowItWorks.tsx` - 작동 방식
   - `HomeHighlights.tsx` - 주요 기능
   - `HomeCTA.tsx` - 최종 CTA

2. **애니메이션 Hook 생성**
   - `hooks/common/useScrollAnimation.ts` 생성
   - Intersection Observer 기반 구현

3. **섹션별 구현**
   - 각 섹션을 독립적으로 개발
   - 애니메이션 효과 적용

4. **통합 및 최적화**
   - 전체 레이아웃 조정
   - 성능 최적화
   - 반응형 테스트

**체크리스트**:
- [x] 컴포넌트 구조 설계 (완료)
- [x] useScrollAnimation Hook 생성 (완료)
- [x] 히어로 섹션 구현 (완료)
- [x] 기능 소개 섹션 구현 (완료)
- [x] 작동 방식 섹션 구현 (완료)
- [x] 주요 기능 하이라이트 구현 (완료)
- [x] 최종 CTA 섹션 구현 (완료)
- [x] 애니메이션 효과 적용 (완료)
- [x] 반응형 디자인 적용 (완료)
- [x] 성능 최적화 (완료)
- [x] 빌드 및 테스트 (완료)

---

## ⚠️ 주의사항

1. **기능 변경 금지**: UI/UX 개선만 수행, 기능은 동일하게 유지
2. **점진적 진행**: 한 번에 하나의 Phase만 진행
3. **단계별 테스트**: 각 Phase 완료 후 빌드/기능 테스트 필수
4. **라우트 경로 유지**: 파일 이동 시 라우트 경로는 변경하지 않음 (사용자 영향 없음)
5. **Import 경로 일괄 수정**: 파일 이동 후 모든 import 경로를 한 번에 수정

---

## 📅 예상 일정

- **Phase 1**: UI/UX 개선 (1-2일)
- **Phase 2**: Pages 폴더 구조 개선 (1일)
- **Phase 3**: Hooks 폴더 구조 개선 (1-2일)
- **Phase 4**: 애니메이션 추가 (선택적, 1일)

---

## ✅ 체크리스트

### Phase 1: UI/UX 개선
- [x] `HistoryItem.tsx`에서 모달 자동 닫힘 구현 (handleSearchWithClose 수정) (완료)
- [x] 배경 클릭/ESC 키 지원 추가 (완료)
- [x] **가게 상세정보 모달 레이아웃 개선** (우선순위 높음) (완료)
  - [x] 모달 위치 조정 (items-start, 상단 여백) (완료)
  - [x] 모달 크기 제한 (max-h 적용) (완료)
  - [x] 스크롤 초기화 (모달 열릴 때 맨 위로) (완료)
  - [x] 스크롤바 스타일 개선 (완료)
  - [x] createPortal 적용 (완료)
- [x] **모든 모달에 createPortal 적용** (일관성 개선) (완료)
  - [x] AuthPromptModal.tsx
  - [x] InitialSetupModal.tsx
  - [x] AddressRegistrationModal.tsx
  - [x] MenuSelectionModal.tsx
  - [x] MenuSelectionEditModal.tsx
  - [x] PreferencesEditModal.tsx
  - [x] AddressListModal.tsx
  - [x] AddressAddModal.tsx
- [x] **Toast/Snackbar 컴포넌트 생성** (완료)
  - [x] Toast 컴포넌트 생성 (성공/에러/경고/정보 타입)
  - [x] Toast Provider 생성 및 App에 추가
  - [x] useToast Hook 생성
- [x] **에러 처리 Hook 생성** (완료)
  - [x] useErrorHandler Hook 생성
  - [x] 에러 타입별 처리 로직 구현
- [x] **alert() 교체** (우선순위: 높은 것부터) (완료)
  - [x] Agent.tsx (11개) (완료)
  - [x] useHistoryMenuActions.ts (3개) (완료)
  - [x] useHistoryAiRecommendations.ts (7개) (완료)
  - [x] MenuSelectionModal.tsx (4개) (완료)
  - [x] AddressRegistrationModal.tsx (2개) (완료)
  - [x] MenuSelectionEditModal.tsx (3개) (완료)
  - [x] InitialSetupModal.tsx (완료)
  - [x] 기타 파일들 (완료)
    - [x] MenuSelectionHistory.tsx (5개)
    - [x] MenuRecommendation.tsx (3개)
    - [x] useAddressList.ts (7개)
    - [x] useAddressModal.ts (4개)
    - [x] useHistoryAiHistory.ts (4개)
    - [x] useAddressSearch.ts (1개)
    - [x] usePreferences.ts (2개)
    - [x] MyPage.tsx (1개)
    - [x] RecommendationHistory.tsx (1개)
    - [x] Register.tsx (2개)
    - [x] ReRegister.tsx (2개)
    - [x] OAuthKakaoRedirect.tsx (4개)
    - [x] OAuthGoogleRedirect.tsx (3개)
- [x] **성공 메시지도 Toast로 통일** (완료)
- [x] 에러 처리 방식 통일 (계획 완료)
- [x] 빌드 성공 확인 (완료)
- [x] 기능 테스트 완료

### Phase 2: Pages 폴더 구조 개선
- [x] 폴더 구조 생성 (완료)
- [x] 파일 이동 (완료)
- [x] 라우트 import 경로 수정 (완료)
- [x] 빌드 성공 확인 (완료)
- [x] 모든 페이지 기능 테스트 완료 (완료)

### Phase 3: Hooks 폴더 구조 개선
- [x] 폴더 구조 생성 (완료)
- [x] 파일 이동 (완료)
- [x] 모든 import 경로 수정 (완료)
- [x] 빌드 성공 확인 (완료)
- [x] 기능 테스트 완료 (완료)

### Phase 4: 애니메이션 추가
- [x] 모달 열림/닫힘 애니메이션 추가 (완료)
- [x] 부드러운 페이드 인/아웃 효과 (완료)
- [x] 스케일 애니메이션 (완료)
- [x] 빌드 성공 확인 (완료)
- [x] 기능 테스트 완료 (완료)

### Phase 5: 홈화면 재디자인
- [x] 컴포넌트 구조 설계 (완료)
- [x] useScrollAnimation Hook 생성 (완료)
- [x] 히어로 섹션 구현 (완료)
- [x] 기능 소개 섹션 구현 (스크롤 애니메이션) (완료)
- [x] 작동 방식 섹션 구현 (완료)
- [x] 주요 기능 하이라이트 구현 (완료)
- [x] 최종 CTA 섹션 구현 (완료)
- [x] 애니메이션 효과 적용 (완료)
- [x] 반응형 디자인 적용 (완료)
- [x] 성능 최적화 (완료)
- [x] 빌드 및 테스트 (완료)

---

## 📝 수행 결과 요약

### Phase 1: UI/UX 개선 (완료)

#### 주요 성과
1. **모달 자동 닫힘 구현**
   - `HistoryItem.tsx`에서 일반 검색 및 AI 추천 버튼 클릭 시 모달 자동 닫힘 구현
   - 사용자 경험 개선: 버튼 클릭 후 즉시 피드백 제공

2. **모달 UX 개선**
   - 배경 클릭 및 ESC 키로 모달 닫기 지원 추가
   - 모든 모달에 `createPortal` 적용하여 헤더/푸터 가림 문제 해결
   - 가게 상세정보 모달 레이아웃 개선 (상단 여백, 스크롤 초기화, 크기 제한)

3. **에러 처리 통일**
   - Toast/Snackbar 컴포넌트 생성 및 적용
   - `useErrorHandler` Hook 생성으로 일관된 에러 처리
   - 총 77개의 `alert()` 호출을 Toast로 교체
   - 사용자 피드백 경험 일관성 확보

#### 변경된 파일
- 컴포넌트: `HistoryItem.tsx`, `PlaceDetailsModal.tsx`, 모든 모달 컴포넌트 (8개)
- Hook: `useErrorHandler.ts` 생성
- 컴포넌트: `Toast.tsx`, `ToastProvider.tsx` 생성
- 20개 파일에서 `alert()` 제거 및 Toast 적용

### Phase 2: Pages 폴더 구조 개선 (완료)

#### 주요 성과
1. **폴더 구조 재구성**
   - 기능별로 페이지를 그룹화하여 유지보수성 향상
   - 인증 관련 페이지: `pages/auth/` 및 `pages/auth/oauth/`
   - 이력 관련 페이지: `pages/history/`
   - 메인 기능 페이지: `pages/main/`
   - 사용자 관련 페이지: `pages/user/`

2. **라우트 경로 유지**
   - 사용자 영향 없이 내부 구조만 개선
   - 모든 라우트 경로는 기존과 동일하게 유지

#### 변경된 파일
- 총 13개 페이지 파일 이동
- `routes/index.tsx`에서 import 경로 수정

### Phase 3: Hooks 폴더 구조 개선 (완료)

#### 주요 성과
1. **Hook 분류 및 구조화**
   - 공통 Hook: `hooks/common/` (useDebounce, useLocalStorage, useModalScrollLock)
   - 도메인별 Hook: `hooks/auth/`, `hooks/address/`, `hooks/history/`, `hooks/map/`, `hooks/place/`, `hooks/user/`
   - 관련 Hook들을 그룹화하여 찾기 쉬운 구조로 개선

2. **Import 경로 일괄 수정**
   - 모든 파일에서 Hook import 경로 업데이트
   - `@/hooks/useXxx` → `@/hooks/domain/useXxx` 형식으로 통일

#### 변경된 파일
- 총 13개 Hook 파일 이동
- 모든 컴포넌트 및 페이지에서 Hook import 경로 수정

### Phase 4: 애니메이션 추가 (완료)

#### 주요 성과
1. **모달 애니메이션**
   - 모달 열림/닫힘 시 부드러운 페이드 인/아웃 효과
   - 스케일 애니메이션으로 시각적 피드백 향상
   - CSS 애니메이션으로 성능 최적화

2. **사용자 경험 개선**
   - 모달 전환 시 자연스러운 애니메이션으로 사용자 경험 향상
   - 모든 모달에 일관된 애니메이션 적용

#### 변경된 파일
- `index.css`에 모달 애니메이션 클래스 추가
- 모든 모달 컴포넌트에 애니메이션 클래스 적용

### Phase 5: 홈화면 재디자인 (완료)

#### 주요 성과
1. **현대적인 랜딩 페이지 디자인**
   - 히어로 섹션: 대형 타이틀, CTA 버튼, 스크롤 인디케이터
   - 기능 소개 섹션: 3개 기능 카드, 스크롤 애니메이션
   - 작동 방식 섹션: 3단계 프로세스 시각화
   - 주요 기능 하이라이트: AI 추천, 지도 검색, 개인화 추천 강조
   - 최종 CTA 섹션: 회원가입 유도

2. **스크롤 기반 인터랙티브 애니메이션**
   - `useScrollAnimation` Hook 생성 (Intersection Observer API 활용)
   - 각 섹션이 뷰포트에 진입할 때 순차적으로 나타나는 애니메이션
   - Fade-in, Slide-up 효과로 동적인 사용자 경험 제공

3. **반응형 디자인**
   - 모바일/태블릿/데스크톱 대응
   - Tailwind CSS 반응형 클래스 활용

#### 생성된 파일
- `hooks/common/useScrollAnimation.ts`
- `components/features/home/HomeHero.tsx`
- `components/features/home/HomeFeatures.tsx`
- `components/features/home/HomeHowItWorks.tsx`
- `components/features/home/HomeHighlights.tsx`
- `components/features/home/HomeCTA.tsx`
- `components/features/home/index.ts`

#### 변경된 파일
- `pages/main/Home.tsx`: 새 섹션 컴포넌트로 교체
- `index.css`: 홈화면 애니메이션 클래스 추가

### 전체 성과 요약

#### 정량적 성과
- **모달 개선**: 8개 모달에 createPortal 적용
- **에러 처리**: 77개 `alert()` 호출을 Toast로 교체
- **폴더 구조**: 13개 페이지, 13개 Hook 재구성
- **홈화면**: 5개 섹션 컴포넌트 생성, 1개 Hook 생성

#### 정성적 성과
- **사용자 경험**: 모달 자동 닫힘, 일관된 에러 처리, 현대적인 홈화면
- **유지보수성**: 기능별 폴더 구조로 코드 탐색 용이성 향상
- **일관성**: 모든 모달에 동일한 패턴 적용, 에러 처리 통일
- **성능**: CSS 애니메이션으로 GPU 가속 활용, 최적화된 스크롤 애니메이션

#### 기술적 개선
- React Portal 패턴 적용으로 z-index 문제 해결
- Intersection Observer API로 성능 최적화된 스크롤 애니메이션
- Custom Hook 패턴으로 재사용성 향상
- TypeScript 타입 안정성 유지

