# 소스 코드 리팩토링 계획

## 📊 현재 문제점 분석

### 1. 파일 크기 문제 (300줄 이상)

**대상 파일**:
- `src/pages/user/MyPage.tsx`: **400줄**
- `src/pages/main/Agent.tsx`: **394줄**
- `src/pages/history/MenuSelectionHistory.tsx`: **383줄**
- `src/hooks/auth/useEmailVerification.ts`: **361줄**
- `src/components/features/restaurant/RestaurantMapModal.tsx`: **339줄**
- `src/hooks/map/useNaverMap.ts`: **320줄**

**문제점**:
- 파일이 너무 커서 유지보수가 어려움
- 단일 책임 원칙 위반 가능성
- 컴포넌트/Hook 분리 필요

---

### 2. 중복 코드 패턴

#### 2.1 모달 애니메이션 로직 중복
**발견 위치**: `src/pages/user/MyPage.tsx` (123-137줄)

**현재 코드**:
```typescript
const [isConfirmModalAnimating, setIsConfirmModalAnimating] = useState(false);
const [shouldRenderConfirmModal, setShouldRenderConfirmModal] = useState(false);

useEffect(() => {
  if (addressList.confirmDefaultAddress) {
    setShouldRenderConfirmModal(true);
    requestAnimationFrame(() => {
      setIsConfirmModalAnimating(true);
    });
  } else {
    setIsConfirmModalAnimating(false);
    const timer = setTimeout(() => {
      setShouldRenderConfirmModal(false);
    }, 300);
    return () => clearTimeout(timer);
  }
}, [addressList.confirmDefaultAddress]);
```

**문제점**:
- 다른 모달들도 동일한 애니메이션 패턴이 필요할 수 있음
- 11개 모달 파일에서 `createPortal` 사용 중이지만 애니메이션 로직은 각각 다를 수 있음
- 공통 Hook으로 추출 가능

**영향 범위**:
- `src/components/features/user/preferences/PreferencesEditModal.tsx`
- `src/components/features/user/address/AddressListModal.tsx`
- `src/components/features/user/address/AddressAddModal.tsx`
- `src/components/features/restaurant/RestaurantMapModal.tsx`
- `src/components/features/restaurant/PlaceDetailsModal.tsx`
- `src/components/features/menu/MenuSelectionModal.tsx`
- `src/components/features/menu/MenuSelectionEditModal.tsx`
- `src/components/common/InitialSetupModal.tsx`
- `src/components/common/AuthPromptModal.tsx`
- `src/components/common/AddressRegistrationModal.tsx`

#### 2.2 formatSeconds 함수 중복
**발견 위치**: `src/hooks/auth/useEmailVerification.ts` (84-90줄)

**현재 코드**:
```typescript
const formatSeconds = useCallback((seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}, []);
```

**문제점**:
- `utils/format.ts`에 이미 포맷팅 함수들이 있음
- 이 함수도 `utils/format.ts`로 이동 가능
- Hook 내부에 있을 필요 없음

#### 2.3 formatDate props 전달 패턴
**발견 위치**: `src/components/features/history/HistoryItem.tsx` (25줄, 28줄)

**현재 코드**:
```typescript
interface HistoryItemProps {
  item: RecommendationHistoryItem;
  formatDate: (dateString: string) => string;
}

export const HistoryItem = ({ item, formatDate }: HistoryItemProps) => {
```

**문제점**:
- `formatDate`를 props로 받고 있지만, `utils/format.ts`에서 직접 import해서 사용 가능
- 불필요한 props 전달

**영향 범위**:
- `src/pages/history/RecommendationHistory.tsx` (HistoryItem 사용하는 곳)

#### 2.4 StrictMode 대응 패턴 중복
**발견 위치**: 여러 파일에서 반복

**패턴 1**: `hasInitializedRef` 패턴
- `src/pages/user/MyPage.tsx` (59줄)
- `src/pages/history/MenuSelectionHistory.tsx` (28줄)
- `src/pages/history/RecommendationHistory.tsx`

**패턴 2**: `prevValueRef` 패턴
- `src/pages/history/MenuSelectionHistory.tsx` (29줄: `prevSelectedDateRef`)
- `src/hooks/place/usePlaceDetails.ts` (26줄: `prevPlaceIdRef`)
- `src/pages/main/Agent.tsx` (60-61줄: `prevIsSearchingRef`, `prevIsAiLoadingRef`)

**문제점**:
- 동일한 패턴이 여러 파일에 반복됨
- 공통 Hook으로 추출 가능

#### 2.5 useEffect + API 호출 패턴 중복
**발견 위치**: 여러 페이지 컴포넌트

**패턴**:
```typescript
const hasInitializedRef = useRef(false);

useEffect(() => {
  if (!isAuthenticated) return;
  if (hasInitializedRef.current) return;
  hasInitializedRef.current = true;
  
  async function loadData() {
    // API 호출
  }
  loadData();
}, [isAuthenticated]);
```

**발견 위치**:
- `src/pages/user/MyPage.tsx` (78-109줄)
- `src/pages/history/MenuSelectionHistory.tsx` (69-90줄)
- `src/pages/history/RecommendationHistory.tsx`

**문제점**:
- 동일한 패턴이 반복됨
- 공통 Hook으로 추출 가능 (`useInitialDataLoad` 같은 Hook)

#### 2.6 로딩 상태 관리 패턴 중복
**발견 위치**: 9개 파일에서 `useState`로 로딩 상태 관리

**발견 파일**:
- `src/pages/history/RecommendationHistory.tsx`
- `src/pages/history/MenuSelectionHistory.tsx`
- `src/pages/auth/oauth/OAuthKakaoRedirect.tsx`
- `src/pages/auth/oauth/OAuthGoogleRedirect.tsx`
- `src/hooks/user/usePreferences.ts`
- `src/hooks/map/useNaverMap.ts`
- `src/hooks/history/useHistoryMenuActions.ts`
- `src/hooks/address/useAddressList.ts`
- `src/components/features/menu/MenuSelectionEditModal.tsx`

**문제점**:
- `useState<boolean>`로 로딩 상태 관리하는 패턴 반복
- `usePlaceDetails`는 `status: 'idle' | 'loading' | 'ready' | 'error'` 패턴 사용 (더 나은 패턴)
- 통일된 로딩 상태 관리 Hook 필요

---

### 3. 불필요한 코드

#### 3.1 상대 경로 import
**발견 위치**: `api/services/` 내부에서 9개 파일

**문제점**:
- 프로젝트 규칙: 모든 import는 `@/` alias 사용, 상대 경로 금지
- `api/services/` 내부에서 상대 경로 사용 중

**영향 파일**:
- `src/api/services/user.ts` (2개)
- `src/api/services/menu.ts` (2개)
- `src/api/services/auth.ts` (2개)
- `src/api/services/search.ts` (2개)
- `src/api/client.ts` (1개)

#### 3.2 console.log
**발견 위치**: `src/hooks/useErrorHandler.ts` (1개)

**문제점**:
- 개발용 로그가 프로덕션 코드에 남아있을 수 있음
- 확인 필요 (의도적인 에러 로깅일 수도 있음)

---

### 4. 개선 가능한 구조

#### 4.1 Agent.tsx 구조
**현재**: 394줄, 모든 로직이 한 파일에 집중

**문제점**:
- Redux 상태를 많이 사용하는 복잡한 컴포넌트
- 스크롤 로직, 메뉴 클릭 핸들러 등이 모두 한 파일에 있음
- Custom Hook으로 분리 가능한 로직들이 있음

**개선 방안**:
- 스크롤 로직을 `useScrollToSection` Hook으로 분리
- 메뉴 클릭 핸들러를 `useMenuActions` Hook으로 분리

#### 4.2 useEmailVerification.ts 구조
**현재**: 361줄, 이메일 인증 관련 모든 로직 포함

**문제점**:
- 타이머 로직, 이메일 검증, 인증 코드 전송 등이 모두 한 Hook에 있음
- `formatSeconds` 같은 유틸 함수가 Hook 내부에 있음

**개선 방안**:
- `formatSeconds`를 `utils/format.ts`로 이동
- 타이머 로직을 별도 Hook으로 분리 고려 (`useVerificationTimer`)

---

## 🎯 개선 목표

1. **파일 크기 축소**: 300줄 이상 파일을 300줄 이하로 분리
2. **중복 코드 제거**: 공통 패턴을 Hook/유틸로 추출
3. **코드 품질 개선**: 상대 경로 → 절대 경로, 불필요한 코드 제거
4. **유지보수성 향상**: 재사용 가능한 Hook/유틸 생성

---

## 📋 단계별 개선 계획

### Phase 1: 유틸리티 함수 통합 (우선순위: 높음)

#### 1.1 formatSeconds를 utils/format.ts로 이동
**작업 내용**:
- `src/hooks/auth/useEmailVerification.ts`의 `formatSeconds` 함수를 `src/utils/format.ts`로 이동
- `useEmailVerification.ts`에서 `formatSeconds` import하여 사용

**예상 시간**: 15분

**체크리스트**:
- [ ] `formatSeconds` 함수를 `utils/format.ts`에 추가
- [ ] `useEmailVerification.ts`에서 `formatSeconds` import로 변경
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 (이메일 인증 타이머 정상 작동 확인)

#### 1.2 formatDate props 제거
**작업 내용**:
- `HistoryItem` 컴포넌트에서 `formatDate` props 제거
- `utils/format.ts`에서 직접 import하여 사용
- `RecommendationHistory.tsx`에서 `formatDate` props 전달 제거

**예상 시간**: 15분

**체크리스트**:
- [ ] `HistoryItem.tsx`에서 `formatDate` props 제거
- [ ] `utils/format.ts`에서 `formatDate` import 추가
- [ ] `RecommendationHistory.tsx`에서 `formatDate` props 전달 제거
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 (날짜 포맷 정상 표시 확인)

---

### Phase 2: 공통 Hook 생성 (우선순위: 높음)

#### 2.1 모달 애니메이션 Hook 생성
**작업 내용**:
- `src/hooks/common/useModalAnimation.ts` 생성
- `MyPage.tsx`의 애니메이션 로직을 Hook으로 추출
- 다른 모달들도 필요시 사용 가능하도록 설계

**Hook 인터페이스**:
```typescript
interface UseModalAnimationReturn {
  isAnimating: boolean;
  shouldRender: boolean;
}

export const useModalAnimation = (isOpen: boolean): UseModalAnimationReturn => {
  // 애니메이션 로직
};
```

**예상 시간**: 30분

**체크리스트**:
- [ ] `useModalAnimation.ts` Hook 생성
- [ ] `MyPage.tsx`에서 Hook 사용으로 변경
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 (모달 애니메이션 정상 작동 확인)

#### 2.2 초기 데이터 로드 Hook 생성
**작업 내용**:
- `src/hooks/common/useInitialDataLoad.ts` 생성
- StrictMode 대응 및 인증 확인 로직 포함
- 여러 페이지에서 재사용 가능하도록 설계

**Hook 인터페이스**:
```typescript
interface UseInitialDataLoadOptions {
  enabled: boolean; // isAuthenticated 등
  loadFn: () => Promise<void>;
  dependencies?: unknown[];
}

export const useInitialDataLoad = (options: UseInitialDataLoadOptions) => {
  // 초기 로드 로직
};
```

**예상 시간**: 1시간

**체크리스트**:
- [ ] `useInitialDataLoad.ts` Hook 생성
- [ ] `MyPage.tsx`에서 Hook 사용으로 변경
- [ ] `MenuSelectionHistory.tsx`에서 Hook 사용으로 변경
- [ ] `RecommendationHistory.tsx`에서 Hook 사용으로 변경
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 (각 페이지 초기 로드 정상 작동 확인)

#### 2.3 이전 값 추적 Hook 생성
**작업 내용**:
- `src/hooks/common/usePrevious.ts` 생성
- `prevValueRef` 패턴을 공통 Hook으로 추출

**Hook 인터페이스**:
```typescript
export const usePrevious = <T>(value: T): T | undefined => {
  // 이전 값 추적 로직
};
```

**예상 시간**: 20분

**체크리스트**:
- [ ] `usePrevious.ts` Hook 생성
- [ ] `MenuSelectionHistory.tsx`에서 Hook 사용으로 변경
- [ ] `usePlaceDetails.ts`에서 Hook 사용으로 변경
- [ ] `Agent.tsx`에서 Hook 사용으로 변경
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 (각 기능 정상 작동 확인)

---

### Phase 3: 파일 분리 (우선순위: 중간)

#### 3.1 Agent.tsx 리팩토링
**작업 내용**:
- 스크롤 로직을 `useScrollToSection` Hook으로 분리
- 메뉴 액션 로직을 `useMenuActions` Hook으로 분리 (이미 `useHistoryMenuActions`가 있으므로 참고)

**예상 시간**: 2시간

**체크리스트**:
- [ ] `useScrollToSection.ts` Hook 생성
- [ ] `Agent.tsx`에서 스크롤 로직 제거 및 Hook 사용
- [ ] 파일 크기 확인 (300줄 이하 목표)
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 (스크롤 기능 정상 작동 확인)

#### 3.2 useEmailVerification.ts 리팩토링
**작업 내용**:
- `formatSeconds` 제거 (Phase 1에서 완료)
- 타이머 로직을 별도 Hook으로 분리 고려 (`useVerificationTimer`)

**예상 시간**: 1시간

**체크리스트**:
- [ ] 타이머 로직 분리 검토
- [ ] 파일 크기 확인 (300줄 이하 목표)
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 (이메일 인증 정상 작동 확인)

---

### Phase 4: 코드 품질 개선 (우선순위: 낮음)

#### 4.1 상대 경로 → 절대 경로 변경
**작업 내용**:
- `api/services/` 내부의 상대 경로를 절대 경로(`@/`)로 변경

**영향 파일**:
- `src/api/services/user.ts`
- `src/api/services/menu.ts`
- `src/api/services/auth.ts`
- `src/api/services/search.ts`
- `src/api/client.ts`

**예상 시간**: 30분

**체크리스트**:
- [ ] 각 파일에서 상대 경로 찾기
- [ ] 절대 경로로 변경
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 (API 호출 정상 작동 확인)

#### 4.2 console.log 확인 및 제거
**작업 내용**:
- `src/hooks/useErrorHandler.ts`의 `console.log` 확인
- 개발용 로그라면 제거 또는 조건부 로깅으로 변경

**예상 시간**: 10분

**체크리스트**:
- [ ] `console.log` 확인
- [ ] 필요시 제거 또는 조건부 로깅으로 변경
- [ ] 빌드 성공 확인

---

## 📊 예상 효과

### 파일 크기 개선
- **Agent.tsx**: 394줄 → 250줄 이하 (예상)
- **useEmailVerification.ts**: 361줄 → 300줄 이하 (예상)

### 중복 코드 제거
- 모달 애니메이션 로직: 1곳 → 공통 Hook
- 초기 데이터 로드 패턴: 3곳 → 공통 Hook
- 이전 값 추적 패턴: 3곳 → 공통 Hook
- formatSeconds: Hook 내부 → utils

### 코드 품질 개선
- 상대 경로: 9곳 → 0곳
- 재사용 가능한 Hook: 3개 추가

---

## ⚠️ 주의사항

1. **기능 변경 금지**: 리팩토링 시 기능 변경 없이 구조만 개선
2. **단계별 진행**: 한 Phase 완료 후 빌드 및 테스트 확인 후 다음 Phase 진행
3. **기존 패턴 확인**: 새로운 Hook 생성 시 기존 코드 패턴 확인 및 일관성 유지
4. **의존성 주의**: Hook 간 의존성 주의 (순환 참조 방지)

---

## 📅 예상 일정

- **Phase 1**: 유틸리티 함수 통합 (30분)
- **Phase 2**: 공통 Hook 생성 (2시간)
- **Phase 3**: 파일 분리 (3시간)
- **Phase 4**: 코드 품질 개선 (40분)

**총 예상 시간**: 6-7시간

---

## ✅ 전체 체크리스트

### Phase 1: 유틸리티 함수 통합
- [ ] formatSeconds를 utils/format.ts로 이동
- [ ] formatDate props 제거

### Phase 2: 공통 Hook 생성
- [ ] useModalAnimation Hook 생성
- [ ] useInitialDataLoad Hook 생성
- [ ] usePrevious Hook 생성

### Phase 3: 파일 분리
- [ ] Agent.tsx 리팩토링
- [ ] useEmailVerification.ts 리팩토링

### Phase 4: 코드 품질 개선
- [ ] 상대 경로 → 절대 경로 변경
- [ ] console.log 확인 및 제거

---

## 📝 참고사항

- 각 Phase 완료 후 반드시 빌드 및 기능 테스트 수행
- 새로운 Hook 생성 시 `hooks/common/` 폴더에 배치
- 유틸리티 함수는 `utils/format.ts`에 추가
- 기존 코드 패턴 확인 후 일관성 유지
