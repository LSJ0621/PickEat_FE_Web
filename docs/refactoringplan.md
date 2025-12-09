# 리팩토링 계획

## 📊 현재 상태 분석 (React 공식 문서 기준 재분석)

### 파일 크기 문제
- **MyPage.tsx**: 978줄 → 345줄 (리팩토링 완료, 하지만 추가 개선 필요)
- **Register.tsx**: 595줄
- **PlaceDetailsModal.tsx**: 470줄
- **RestaurantList.tsx**: 441줄
- **HistoryItem.tsx**: 441줄
- **InitialSetupModal.tsx**: 441줄
- **Map.tsx**: 432줄
- **ReRegister.tsx**: 416줄
- **Agent.tsx**: 376줄

### React 패턴 문제점 (React 공식 문서 기준)

#### 1. useEffect 의존성 배열 문제
- **문제**: Hook 반환 객체를 의존성 배열에 직접 사용 (무한 루프 위험)
- **발견 위치**: `MyPage.tsx` (수정 완료, 하지만 패턴 개선 필요)
- **React 권장**: 함수를 `useEffect` 내부에서 정의하거나 `useRef`로 안정화

#### 2. Custom Hook 설계 문제
- **문제**: Hook이 너무 많은 상태와 함수를 객체로 반환 (27개 속성)
- **발견 위치**: `useAddressManagement.ts`, `usePreferences.ts`
- **React 권장**: 구체적인 고수준 사용 사례에 집중, 단일 책임 원칙

#### 3. 중복 API 호출 문제
- **문제**: `initializeAuth`에서 `getPreferences()` 호출 + `MyPage`에서도 호출
- **발견 위치**: `authSlice.ts` (114줄), `MyPage.tsx` (73줄)
- **React 권장**: 상태 중복 제거, 단일 소스 원칙

#### 4. StrictMode 미대응
- **문제**: 개발 모드에서 2번 렌더링되는 것 미고려
- **발견 위치**: 여러 `useEffect` (일부 수정 완료)
- **React 권장**: `useRef`로 초기화 여부 추적

#### 5. 상태 구조화 문제
- **문제**: Redux와 로컬 상태 간 중복 (preferences, addresses)
- **발견 위치**: `MyPage.tsx` (로컬 상태) vs `authSlice.ts` (Redux)
- **React 권장**: 단일 소스 원칙, 중복 상태 제거

#### 6. 클린업 함수 누락 가능성
- **문제**: 타이머, 이벤트 리스너 등 클린업 필요 여부 확인 필요
- **확인 필요**: 모든 `useEffect` 검토

### 기타 문제점
- 개발용 `console.log` 다수 존재 (8곳)
- 상대 경로 import 일부 존재 (`api/services/` 내부)
- 중복 코드 가능성 (주소 검색, 모달 관리 등)
- 불필요한 파일: `store/slices/authSlice.example.ts` (예시 파일, 사용 안 함)
- 사용하지 않는 변수/import 가능성

---

## 🎯 리팩토링 목표

1. **파일 크기 축소**: 300줄 이내로 분리
2. **컴포넌트 분리**: 모달, 섹션별로 독립 컴포넌트 추출
3. **Custom Hook 추출**: 비즈니스 로직을 Hook으로 분리
4. **코드 품질 개선**: console.log 제거, 상대 경로 수정
5. **불필요한 코드 제거**: 사용하지 않는 파일/import/변수/함수 제거
6. **디자인 마이그레이션**: shadcn/ui로 UI 교체 (로직은 유지)
7. **유지보수성 향상**: 중복 코드 제거, 분리된 로직은 원본에서 제거하여 단일 책임 원칙 준수

---

## 📁 폴더 구조 개선 계획

### 현재 구조
```
src/components/
├── common/          # 공통 컴포넌트
├── features/        # 기능별 컴포넌트
│   ├── history/
│   ├── menu/
│   └── restaurant/
├── layout/          # 레이아웃
└── ui/              # shadcn/ui 컴포넌트
```

### 개선된 구조 (리팩토링 후)
```
src/components/
├── common/          # 공통 컴포넌트 (기존 유지)
├── features/        # 기능별 컴포넌트
│   ├── auth/        # 인증 관련 (신규)
│   │   ├── EmailVerificationSection.tsx
│   │   ├── PasswordInputSection.tsx
│   │   └── index.ts
│   ├── history/     # 이력 관련 (기존 유지)
│   ├── menu/        # 메뉴 관련 (기존 유지)
│   ├── restaurant/  # 식당 관련 (기존 + 신규)
│   │   ├── PlaceMiniMap.tsx
│   │   ├── PlaceBlogsSection.tsx
│   │   ├── PlaceReviewsSection.tsx
│   │   └── ...
│   └── user/        # 사용자 관련 (신규)
│       ├── address/
│       │   ├── AddressSection.tsx
│       │   ├── AddressAddModal.tsx
│       │   ├── AddressListModal.tsx
│       │   └── index.ts
│       ├── preferences/
│       │   ├── PreferencesSection.tsx
│       │   ├── PreferencesEditModal.tsx
│       │   └── index.ts
│       └── index.ts
├── layout/          # 레이아웃 (기존 유지)
└── ui/              # shadcn/ui 컴포넌트 (기존 유지)
```

**폴더 구조 원칙**:
- 도메인별로 폴더 분리 (`user`, `auth`, `restaurant` 등)
- 관련 컴포넌트는 하위 폴더로 그룹화 (`user/address/`, `user/preferences/`)
- 각 폴더마다 `index.ts`로 export 관리
- 섹션 컴포넌트와 모달 컴포넌트는 같은 도메인 폴더에 배치

---

## 📋 단계별 리팩토링 계획

**⚠️ 중요**: 각 Phase 시작 전 Context7의 React 공식 문서(`/websites/react_dev`)를 확인하여 다음 사항을 검토:
1. useEffect 패턴 (의존성 배열, 클린업 함수, StrictMode 대응)
2. Custom Hook 설계 (구체적인 사용 사례, 단일 책임)
3. 컴포넌트 구조 (관심사 분리, 상태 구조화)
4. 상태 관리 (중복 제거, 단일 소스 원칙, **저장 후 동기화**)
5. **기존 코드 패턴 확인**: 같은 기능을 하는 기존 코드의 상태 관리 패턴 확인 및 일관성 유지

### Phase 1: MyPage.tsx 리팩토링 ✅ (완료)

**현재 상태**: 978줄 → 352줄 (64% 감소, 리팩토링 및 React 패턴 개선 완료)

**완료된 작업**:
- ✅ Custom Hooks 추출 (`useAddressManagement`, `usePreferences`)
- ✅ 컴포넌트 분리 (AddressSection, AddressAddModal, AddressListModal, PreferencesSection, PreferencesEditModal)
- ✅ StrictMode 대응 (`useRef`로 초기화 추적)

**추가 개선 필요 사항** (React 공식 문서 기준):

#### 1. 중복 API 호출 제거 ✅
- **문제**: `initializeAuth`에서 `getPreferences()` 호출 + `MyPage`에서도 호출
- **해결 방안**: Redux 상태를 단일 소스로 사용하거나, 로컬 상태 초기화 시 Redux에서 가져오기
- **작업**: `MyPage.tsx`의 `useEffect`에서 Redux 상태 확인 후 없을 때만 API 호출
- **상태**: 완료

#### 2. useEffect 패턴 개선 ✅
- **문제**: 함수 참조를 `useRef`로 관리하는 복잡한 패턴
- **React 권장**: 함수를 `useEffect` 내부에서 정의하거나, `useCallback`으로 안정화
- **작업**: `MyPage.tsx`의 `useEffect`를 React 공식 문서 권장 방식으로 리팩토링
- **상태**: 완료

#### 3. 상태 구조화 개선 ✅
- **문제**: Redux와 로컬 상태 간 중복 (preferences, addresses)
- **React 권장**: 단일 소스 원칙, 중복 상태 제거
- **작업**: Redux 상태를 초기값으로 사용하도록 `usePreferences` Hook 수정
- **상태**: 완료

#### 4. 저장 후 상태 동기화 ✅
- **문제**: 데이터 저장 후 Redux 상태가 업데이트되지 않아 화면에 반영되지 않음
- **발견**: `usePreferences` Hook에서 `handleSavePreferences`가 DB 저장 후 로컬 상태만 업데이트하고 Redux 상태는 업데이트하지 않음
- **해결**: `InitialSetupModal`의 패턴을 확인하고 동일하게 `dispatch(updateUser(...))` 호출 추가
- **작업**: `usePreferences` Hook에 Redux 상태 업데이트 로직 추가
- **상태**: 완료

#### 5. Custom Hook 설계 개선 (선택적)
- **문제**: Hook이 27개 속성을 객체로 반환 (너무 많은 책임)
- **React 권장**: 구체적인 고수준 사용 사례에 집중, 단일 책임 원칙
- **작업**: Hook을 더 작은 단위로 분리 고려 (예: `useAddressList`, `useAddressSearch`, `useAddressForm`)
- **상태**: 선택적 개선 (현재 동작에는 문제 없음)

**작업 순서**:
1. ✅ Custom Hooks 추출 (완료)
2. ✅ 컴포넌트 분리 (완료)
3. ✅ 중복 API 호출 제거 (완료)
4. ✅ useEffect 패턴 개선 (완료)
5. ✅ 상태 구조화 개선 (완료)
6. ✅ 저장 후 상태 동기화 (완료)

**폴더 구조**:
```
src/components/features/user/
├── address/
│   ├── AddressSection.tsx          # 주소 관리 섹션 (표시용)
│   ├── AddressAddModal.tsx          # 주소 추가 모달
│   ├── AddressListModal.tsx         # 주소 리스트 관리 모달
│   └── index.ts                     # export 모음
├── preferences/
│   ├── PreferencesSection.tsx       # 취향 관리 섹션 (표시용)
│   ├── PreferencesEditModal.tsx     # 취향 수정 모달
│   └── index.ts                     # export 모음
└── index.ts                         # 전체 export 모음
```

**분리 계획**:
1. **주소 관리 섹션** → `components/features/user/address/AddressSection.tsx`
   - 주소 리스트 표시
   - 주소 추가/삭제/기본주소 변경 로직
   - 예상: ~200줄

2. **주소 추가 모달** → `components/features/user/address/AddressAddModal.tsx`
   - 주소 검색 UI
   - 주소 선택 및 별칭 입력
   - 예상: ~150줄

3. **주소 리스트 관리 모달** → `components/features/user/address/AddressListModal.tsx`
   - 주소 리스트 표시
   - 편집 모드 (삭제 선택)
   - 기본주소 변경 확인
   - 예상: ~200줄

4. **취향 관리 섹션** → `components/features/user/preferences/PreferencesSection.tsx`
   - 좋아하는 것/싫어하는 것 표시
   - AI 리포트 표시
   - 예상: ~100줄

5. **취향 수정 모달** → `components/features/user/preferences/PreferencesEditModal.tsx`
   - 좋아하는 것/싫어하는 것 추가/삭제
   - 예상: ~150줄

6. **Custom Hooks 추출**:
   - `hooks/useAddressManagement.ts` - 주소 관련 로직
   - `hooks/usePreferences.ts` - 취향 관련 로직
   - 예상: 각 ~100줄

**예상 결과**: MyPage.tsx → ~200줄 이하

**작업 순서**:
1. Custom Hooks 추출 (의존성 없음)
2. 주소 관리 섹션 컴포넌트 분리 → **MyPage.tsx에서 해당 JSX 코드 제거**
3. 주소 모달들 분리 → **MyPage.tsx에서 해당 모달 JSX 코드 제거**
4. 취향 관리 섹션/모달 분리 → **MyPage.tsx에서 해당 JSX 코드 제거**
5. MyPage.tsx 정리 및 통합 → **분리된 컴포넌트 import하여 사용, 원본 코드는 모두 제거**
6. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

**중요**: 각 단계에서 분리한 코드는 MyPage.tsx에서 반드시 제거하고, 새로 만든 컴포넌트를 import해서 사용해야 함. 분리만 하고 원본 코드를 남기면 중복 코드가 되어 유지보수성 저하.

**⚠️ Custom Hook 사용 시 주의사항**:
- Hook이 객체를 반환할 때, `useEffect` 의존성 배열에 Hook 반환 객체 전체를 넣지 않기
- Hook은 매 렌더마다 새 객체를 반환하므로 무한 루프 발생 가능
- 대신 `useCallback`으로 안정화된 함수만 의존성으로 사용: `}, [hookObject.functionName]`
- 각 단계 후 실제 브라우저에서 기능 테스트 필수 (빌드/타입 체크만으로는 무한 루프 같은 런타임 문제 발견 불가)

---

### Phase 2: Register.tsx 리팩토링

**현재 문제**: 595줄, 복잡한 이메일 인증 로직

**폴더 구조**:
```
src/components/features/auth/
├── EmailVerificationSection.tsx     # 이메일 인증 섹션
├── PasswordInputSection.tsx         # 비밀번호 입력 섹션
└── index.ts                         # export 모음
```

**분리 계획**:
1. **이메일 인증 섹션** → `components/features/auth/EmailVerificationSection.tsx`
   - 이메일 입력 및 중복 확인
   - 인증번호 발송 및 검증
   - 예상: ~200줄

2. **비밀번호 입력 섹션** → `components/features/auth/PasswordInputSection.tsx`
   - 비밀번호 및 확인 입력
   - 검증 메시지 표시
   - 예상: ~100줄

3. **Custom Hook**: `hooks/useEmailVerification.ts`
   - 이메일 중복 확인
   - 인증번호 발송/검증 로직
   - 타이머 관리
   - 예상: ~150줄

**예상 결과**: Register.tsx → ~200줄 이하

**작업 순서**:
1. Custom Hook 추출
2. 이메일 인증 섹션 컴포넌트 분리 → **Register.tsx에서 해당 JSX 코드 제거**
3. 비밀번호 입력 섹션 컴포넌트 분리 → **Register.tsx에서 해당 JSX 코드 제거**
4. Register.tsx 정리 및 통합 → **분리된 컴포넌트 import하여 사용, 원본 코드는 모두 제거**
5. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

**중요**: 분리한 섹션 코드는 Register.tsx에서 반드시 제거하고, 새로 만든 컴포넌트를 import해서 사용해야 함.

---

### Phase 3: PlaceDetailsModal.tsx 리팩토링

**현재 문제**: 470줄, 지도 초기화 + 블로그 로딩 + 리뷰 관리

**폴더 구조**:
```
src/components/features/restaurant/
├── PlaceDetailsModal.tsx            # 메인 모달 (리팩토링 후)
├── PlaceMiniMap.tsx                  # 지도 컴포넌트
├── PlaceBlogsSection.tsx             # 블로그 섹션
├── PlaceReviewsSection.tsx           # 리뷰 섹션
└── index.ts                          # export 모음 (기존 유지)
```

**분리 계획**:
1. **지도 컴포넌트** → `components/features/restaurant/PlaceMiniMap.tsx`
   - 네이버 지도 초기화
   - 마커 표시
   - 예상: ~100줄

2. **블로그 섹션** → `components/features/restaurant/PlaceBlogsSection.tsx`
   - 블로그 로딩 및 표시
   - 예상: ~100줄

3. **리뷰 섹션** → `components/features/restaurant/PlaceReviewsSection.tsx`
   - 리뷰 표시 및 확장/축소
   - 예상: ~150줄

4. **Custom Hook**: `hooks/usePlaceDetails.ts`
   - 장소 상세 정보 로딩
   - 예상: ~50줄

**예상 결과**: PlaceDetailsModal.tsx → ~150줄 이하

**작업 순서**:
1. Custom Hook 추출
2. 지도 컴포넌트 분리 → **PlaceDetailsModal.tsx에서 지도 관련 코드 제거**
3. 블로그 섹션 분리 → **PlaceDetailsModal.tsx에서 블로그 관련 코드 제거**
4. 리뷰 섹션 분리 → **PlaceDetailsModal.tsx에서 리뷰 관련 코드 제거**
5. PlaceDetailsModal.tsx 정리 및 통합 → **분리된 컴포넌트 import하여 사용, 원본 코드는 모두 제거**
6. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

**중요**: 분리한 섹션 코드는 PlaceDetailsModal.tsx에서 반드시 제거하고, 새로 만든 컴포넌트를 import해서 사용해야 함.

---

### Phase 4: 기타 파일 리팩토링

**RestaurantList.tsx (441줄)**:
- 지도 모달 분리 (이미 분리되어 있음)
- 리스트 아이템 컴포넌트 분리

**HistoryItem.tsx (441줄)**:
- AI 추천 섹션 분리
- 검색 결과 섹션 분리

**InitialSetupModal.tsx (441줄)**:
- 주소 설정 섹션 분리
- 취향 설정 섹션 분리

**Map.tsx (432줄)**:
- 지도 초기화 로직 Hook으로 추출
- 마커 관리 로직 분리

**작업 순서**:
1. 각 파일별로 컴포넌트/Hook 분리
2. 분리된 코드는 원본 파일에서 제거하고 새 컴포넌트/Hook import하여 사용
3. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

---

### Phase 5: 코드 품질 개선

1. **console.log 제거** (8곳)
   - 개발용 로그 제거 또는 조건부 로깅으로 변경
   - 파일: `api/services/menu.ts`, `api/services/auth.ts`, `utils/userSetup.ts`, `pages/Map.tsx`, `components/features/restaurant/RestaurantList.tsx`

2. **상대 경로 → 절대 경로**
   - `api/services/` 내부 파일들 수정
   - `routes/index.tsx` 수정

3. **하드코딩 값 제거**
   - 매직 넘버/문자열을 `utils/constants.ts`로 이동

4. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정
   - 모든 TypeScript 에러 수정 (타입 에러, 사용하지 않는 import/변수 등)
   - 빌드 성공 확인 필수

---

### Phase 6: 불필요한 코드 제거

**목표**: 사용하지 않는 코드 제거로 코드베이스 정리

1. **예시 파일 삭제**
   - `store/slices/authSlice.example.ts` 삭제 (실제 사용 안 함)

2. **사용하지 않는 import 제거**
   - TypeScript 컴파일러로 미사용 import 확인
   - 각 파일별로 정리

3. **사용하지 않는 변수/함수 제거**
   - 선언만 되고 사용되지 않는 변수 제거
   - 호출되지 않는 함수 제거
   - TypeScript 경고 확인

4. **주석 처리된 코드 제거**
   - 주석 처리된 코드 블록 제거
   - 필요시 Git 히스토리에서 복구 가능

5. **중복 코드 확인 및 제거** (체계적 검증 필수, 반복 확인)
   - 유사한 로직이 여러 곳에 있으면 함수/Hook으로 통합
   - 공통 유틸리티 함수로 추출
   - 추출 후 원본 위치에서 중복 코드 제거 필수
   - 새로 만든 함수/Hook을 사용하도록 모든 위치에서 변경
   
   **중복 코드 검증 체크리스트** (반드시 확인):
   - [ ] 이메일 검증 함수 중복 확인 (`validateEmail` 등)
     - `utils/validation.ts`의 `isValidEmail` 사용 여부 확인
     - 중복 함수 발견 시 `isValidEmail`로 통합
   - [ ] 비밀번호 검증 로직 중복 확인 (`password.length < 6` 등)
     - `utils/validation.ts`의 `isValidPassword` 사용 여부 확인
     - `utils/constants.ts`의 `PASSWORD_MIN_LENGTH` 사용 여부 확인
     - 하드코딩된 값 제거 및 상수/유틸리티 함수 사용
   - [ ] 비밀번호 확인 검증 중복 확인 (`password !== confirmPassword`)
     - `utils/validation.ts`의 `isPasswordMatch` 사용 여부 확인
     - `utils/constants.ts`의 `ERROR_MESSAGES.PASSWORD_MISMATCH` 사용 여부 확인
     - 하드코딩된 메시지 제거 및 상수 사용
   - [ ] 주소 검색 로직 중복 확인
     - `useAddressSearch` Hook 사용 여부 확인
     - 중복 로직 발견 시 Hook으로 통합
   - [ ] OAuth 리다이렉트 로직 중복 확인
     - 카카오/구글 리다이렉트 로직 비교 분석
     - 공통 로직 Hook으로 추출 가능 여부 확인
   - [ ] 에러 처리 패턴 중복 확인 (`isAxiosError` 체크 등)
     - `extractErrorMessage` 사용 여부 확인
     - `isAxiosError(error) && error.response?.data?.message` 패턴 제거
     - 중복 에러 처리 로직 통합
   - [ ] 기존 유틸리티 함수 확인
     - `utils/validation.ts`의 모든 함수 확인 (`isValidEmail`, `isValidPassword`, `isPasswordMatch`, `isValidPhone`, `isEmpty`)
     - `utils/constants.ts`의 모든 상수 확인 (`VALIDATION`, `ERROR_MESSAGES` 등)
     - 중복 함수/상수 발견 시 기존 유틸리티 사용
   - [ ] **useEffect + API 호출 패턴 중복 확인** (StrictMode 대응 필수)
     - 유사한 파일명 패턴 검색 (`*History.tsx`, `*Page.tsx` 등)
     - `useEffect`에서 API 호출하는 모든 파일 확인
     - `useRef`로 초기화 추적하는지 확인 (`hasInitializedRef`, `prev*Ref` 등)
     - StrictMode 대응 패턴 적용 여부 확인
     - 중복 패턴 발견 시 즉시 수정

**작업 순서** (반복 확인 프로세스):
1. 예시 파일 삭제 (가장 안전)
2. TypeScript 빌드로 미사용 코드 확인
3. 각 파일별로 사용하지 않는 import/변수 제거
4. 주석 처리된 코드 제거
5. **중복 코드 체계적 검증** (위 체크리스트 항목별 확인)
6. 중복 코드 통합 (발견된 중복 코드 수정)
7. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정
8. **반복 확인**: 중복 코드가 없어질 때까지 5-7단계 반복
   - 각 반복마다 체크리스트 항목별로 재확인
   - `grep` 및 `codebase_search`로 중복 패턴 재검색
   - 발견된 중복 코드 즉시 수정
   - 빌드 성공 확인 후 다음 반복 진행
   - 중복 코드가 더 이상 발견되지 않을 때까지 반복

---

## ⚠️ 주의사항

1. **기능 변경 금지**: 리팩토링은 구조만 개선, 기능은 동일하게 유지
2. **단계별 테스트**: 각 Phase 완료 후 빌드/타입 체크/기능 테스트 필수 (실제 브라우저에서 테스트 필수)
3. **점진적 진행**: 한 번에 하나의 파일/기능만 리팩토링
4. **커밋 분리**: 각 Phase는 별도 커밋으로 관리
5. **분리된 코드 제거 필수**: 컴포넌트나 로직을 다른 파일로 분리했으면 원래 위치에서 해당 코드를 반드시 제거하고, 새로 만든 컴포넌트/Hook을 import해서 사용
6. **중복 코드 제거**: 동일한 로직이 여러 곳에 있으면 공통 함수/Hook으로 추출하고, 추출 후 원본 위치에서 제거
7. **유지보수성 우선**: 코드 분리와 중복 제거를 통해 유지보수성을 향상시키는 것이 리팩토링의 핵심 목표
8. **Custom Hook 사용 시 주의**: Hook이 객체를 반환할 때, `useEffect` 의존성 배열에 Hook 반환 객체 전체를 넣지 않기. 무한 루프 발생 가능. `useCallback`으로 안정화된 함수만 의존성으로 사용
9. **기존 코드 패턴 확인**: 같은 기능을 하는 기존 코드가 있으면 그 패턴을 확인하고 일관성 유지. 특히 상태 관리(Redux 업데이트, 로컬 상태 업데이트) 패턴을 반드시 확인. 저장 후 Redux 상태 동기화 필요 여부 확인 필수

---

## 📅 예상 일정

- **Phase 1**: MyPage.tsx 리팩토링 (가장 우선)
- **Phase 2**: Register.tsx 리팩토링
- **Phase 3**: PlaceDetailsModal.tsx 리팩토링
- **Phase 4**: 기타 파일 리팩토링
- **Phase 5**: 코드 품질 개선
- **Phase 6**: 불필요한 코드 제거
- **Phase 7**: 추가 파일 컴포넌트 분리 (300줄 초과 파일)
- **Phase 8**: 중복 코드 통합 및 재사용 컴포넌트 생성
- **Phase 9**: shadcn/ui 디자인 마이그레이션

각 Phase는 독립적으로 완료 가능하며, 필요시 중단하고 다음 단계로 진행 가능.

---

## ✅ 체크리스트

### Phase 1 체크리스트

**완료된 항목**:
- [x] `components/features/user/` 폴더 구조 생성
- [x] `components/features/user/address/` 폴더 생성
- [x] `components/features/user/preferences/` 폴더 생성
- [x] `hooks/useAddressManagement.ts` 생성
- [x] `hooks/usePreferences.ts` 생성
- [x] `components/features/user/address/AddressSection.tsx` 생성
- [x] `components/features/user/address/AddressAddModal.tsx` 생성
- [x] `components/features/user/address/AddressListModal.tsx` 생성
- [x] `components/features/user/address/index.ts` 생성
- [x] `components/features/user/preferences/PreferencesSection.tsx` 생성
- [x] `components/features/user/preferences/PreferencesEditModal.tsx` 생성
- [x] `components/features/user/preferences/index.ts` 생성
- [x] `components/features/user/index.ts` 생성
- [x] MyPage.tsx 리팩토링 및 통합
- [x] StrictMode 대응 (`useRef`로 초기화 추적)
- [x] 빌드 성공 확인
- [x] 타입 체크 통과
- [x] **실제 브라우저에서 기능 테스트** (무한 루프 문제 해결 포함)

**추가 개선 완료 항목** (React 공식 문서 기준):
- [x] 중복 API 호출 제거 (`initializeAuth`와 `MyPage` 간 중복)
- [x] useEffect 패턴 개선 (함수를 useEffect 내부에서 정의하거나 useCallback으로 안정화)
- [x] 상태 구조화 개선 (Redux와 로컬 상태 간 중복 제거, Redux 상태를 초기값으로 사용)
- [x] 저장 후 상태 동기화 (Redux 상태 업데이트 추가)
- [x] 기존 코드 패턴 확인 (`InitialSetupModal`의 패턴 확인 및 일관성 유지)
- [x] 클린업 함수 확인 (타이머, 이벤트 리스너 등 - useDebounce는 이미 클린업 함수 있음)

**선택적 개선 항목**:
- [ ] Custom Hook 설계 개선 (더 작은 단위로 분리 고려 - 현재 동작에는 문제 없음)

### Phase 2 체크리스트
- [ ] `hooks/useEmailVerification.ts` 생성
- [ ] `components/features/auth/EmailVerificationSection.tsx` 생성
- [ ] `components/features/auth/PasswordInputSection.tsx` 생성
- [ ] Register.tsx 리팩토링
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 완료

### Phase 3 체크리스트
- [ ] `hooks/usePlaceDetails.ts` 생성
- [ ] `components/features/restaurant/PlaceMiniMap.tsx` 생성
- [ ] `components/features/restaurant/PlaceBlogsSection.tsx` 생성
- [ ] `components/features/restaurant/PlaceReviewsSection.tsx` 생성
- [ ] PlaceDetailsModal.tsx 리팩토링
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 완료

### Phase 5 체크리스트
- [ ] console.log 제거/조건부 처리
- [ ] 상대 경로 → 절대 경로 변경
- [ ] 하드코딩 값 상수화
- [ ] 빌드 성공 확인

### Phase 6 체크리스트 ✅ (완료)
- [x] `store/slices/authSlice.example.ts` 삭제
- [x] TypeScript 빌드로 미사용 코드 확인 (사용하지 않는 코드 없음 확인)
- [x] 사용하지 않는 import 제거 (Phase 5에서 이미 완료)
- [x] 사용하지 않는 변수/함수 제거 (Phase 5에서 이미 완료)
- [x] 주석 처리된 코드 제거 (주석 처리된 코드 없음 확인)
- [x] **중복 코드 체계적 검증** (아래 항목별 확인 완료)
  - [x] 이메일 검증 함수 중복 확인 및 통합 (`validateEmail` → `isValidEmail` 사용)
    - `Register.tsx`, `ReRegister.tsx`, `useEmailVerification.ts`에서 중복 함수 제거
  - [x] 비밀번호 검증 로직 중복 확인 및 통합 (`password.length < 6` → `isValidPassword` 사용)
    - `Register.tsx`, `ReRegister.tsx`, `PasswordInputSection.tsx`에서 하드코딩 제거
  - [x] 비밀번호 확인 검증 중복 확인 및 통합 (`password !== confirmPassword` → `isPasswordMatch` 사용)
    - `Register.tsx`, `ReRegister.tsx`, `PasswordReset.tsx`, `PasswordInputSection.tsx`에서 중복 제거
    - `ERROR_MESSAGES.PASSWORD_MISMATCH` 상수로 메시지 통합
  - [x] 주소 검색 로직 중복 확인 및 통합 (`useAddressSearch` Hook 생성 및 사용)
    - `InitialSetupAddressSection.tsx`, `AddressRegistrationModal.tsx`에서 중복 로직 제거
  - [x] OAuth 리다이렉트 로직 중복 확인 (카카오 전용 기능으로 인해 전체 Hook화는 부적합)
    - 에러 처리 로직은 이미 `extractErrorMessage`로 통합됨
  - [x] 에러 처리 패턴 중복 확인 및 통합 (`isAxiosError` 체크 제거)
    - `Login.tsx`, `ReRegister.tsx`, `OAuthKakaoRedirect.tsx`, `OAuthGoogleRedirect.tsx`, `useEmailVerification.ts`에서 중복 패턴 제거
    - `extractErrorMessage`만 사용하도록 통합
  - [x] 기존 유틸리티 함수 확인 완료 (`utils/validation.ts`, `utils/constants.ts`)
- [x] 중복 코드 통합 (발견된 중복 코드 수정 완료)
- [x] **반복 확인 1차**: 중복 코드 재검색 및 추가 수정 완료
  - 에러 처리 패턴 중복 재확인 및 제거
  - 비밀번호 확인 검증 중복 재확인 및 제거
- [x] **반복 확인 2차**: 검증 메시지 하드코딩 제거
  - `isEmpty` 함수 사용으로 빈 값 검증 통합
  - 입력 필수 메시지 상수화 (`ERROR_MESSAGES`에 추가)
  - 이메일 인증 관련 메시지 상수화
- [x] **반복 확인 3차**: useEffect + API 호출 패턴 중복 확인
  - `RecommendationHistory.tsx`에서 중복 API 호출 문제 발견 및 수정
  - `MenuSelectionHistory.tsx`와 동일한 패턴 적용 (`useRef`로 StrictMode 대응)
- [x] 빌드 성공 확인

---

### Phase 7: 추가 파일 컴포넌트 분리 (300줄 초과 파일)

**목표**: 300줄을 초과하는 파일들을 더 작은 컴포넌트로 분리하여 유지보수성 향상

**대상 파일**:
1. **ReRegister.tsx** (390줄) - 재가입 페이지
2. **RestaurantList.tsx** (415줄) - 식당 리스트 컴포넌트
3. **Agent.tsx** (375줄) - 에이전트 페이지 (선택적, 이미 Hook으로 분리됨)

---

#### 7.1 ReRegister.tsx 리팩토링

**현재 문제**: 390줄, 이메일 인증 로직과 비밀번호 입력 로직이 한 파일에 있음

**분리 계획**:
1. **이메일 인증 섹션** → `components/features/auth/EmailVerificationSection.tsx` 재사용
   - Register.tsx에서 이미 분리된 컴포넌트 재사용
   - 재가입 전용 props 추가 (예: `verificationType: 'RE_REGISTER'`)
   - 예상: 기존 컴포넌트 확장 또는 재사용

2. **비밀번호 입력 섹션** → `components/features/auth/PasswordInputSection.tsx` 재사용
   - Register.tsx에서 이미 분리된 컴포넌트 재사용
   - 예상: 기존 컴포넌트 재사용

3. **재가입 폼 섹션** → `components/features/auth/ReRegisterFormSection.tsx` (신규)
   - 이름 입력 필드
   - 재가입 버튼 및 로직
   - 예상: ~100줄

**예상 결과**: ReRegister.tsx → ~200줄 이하

**작업 순서**:
1. 기존 `EmailVerificationSection`에 `verificationType` prop 추가 (선택적)
2. 기존 `PasswordInputSection` 재사용 확인
3. 재가입 폼 섹션 컴포넌트 분리 → **ReRegister.tsx에서 해당 JSX 코드 제거**
4. ReRegister.tsx 정리 및 통합 → **분리된 컴포넌트 import하여 사용, 원본 코드는 모두 제거**
5. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

**중요**: 분리한 섹션 코드는 ReRegister.tsx에서 반드시 제거하고, 새로 만든 컴포넌트를 import해서 사용해야 함.

---

#### 7.2 RestaurantList.tsx 리팩토링

**현재 문제**: 415줄, 지도 모달 로직이 메인 컴포넌트에 포함되어 있음

**분리 계획**:
1. **지도 모달 컴포넌트** → `components/features/restaurant/RestaurantMapModal.tsx` (신규)
   - 네이버 지도 초기화 로직
   - 마커 표시 및 관리
   - 모달 UI
   - 예상: ~200줄

2. **식당 리스트 헤더** → `components/features/restaurant/RestaurantListHeader.tsx` (신규)
   - 제목 및 주소 표시
   - 액션 버튼들 (지도 보기 등)
   - 예상: ~80줄

**예상 결과**: RestaurantList.tsx → ~200줄 이하

**작업 순서**:
1. 지도 모달 컴포넌트 분리 → **RestaurantList.tsx에서 지도 관련 코드 제거**
2. 리스트 헤더 컴포넌트 분리 → **RestaurantList.tsx에서 헤더 관련 코드 제거**
3. RestaurantList.tsx 정리 및 통합 → **분리된 컴포넌트 import하여 사용, 원본 코드는 모두 제거**
4. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

**중요**: 분리한 섹션 코드는 RestaurantList.tsx에서 반드시 제거하고, 새로 만든 컴포넌트를 import해서 사용해야 함.

---

#### 7.3 Agent.tsx 리팩토링 (선택적)

**현재 상태**: 375줄, 이미 Custom Hook으로 로직이 분리되어 있음

**분리 계획** (선택적):
1. **메뉴 추천 섹션** → `components/features/menu/MenuRecommendationSection.tsx` (신규)
   - MenuRecommendation 컴포넌트 래핑
   - 섹션 레이아웃 및 스타일
   - 예상: ~50줄

2. **AI 추천 섹션** → `components/features/restaurant/AiRecommendationSection.tsx` (신규)
   - AiPlaceRecommendations 컴포넌트 래핑
   - 섹션 레이아웃 및 스타일
   - 예상: ~50줄

3. **식당 검색 결과 섹션** → `components/features/restaurant/RestaurantSearchSection.tsx` (신규)
   - RestaurantList 컴포넌트 래핑
   - 섹션 레이아웃 및 스타일
   - 예상: ~50줄

**예상 결과**: Agent.tsx → ~200줄 이하

**작업 순서** (선택적):
1. 각 섹션 컴포넌트 분리 → **Agent.tsx에서 해당 JSX 코드 제거**
2. Agent.tsx 정리 및 통합 → **분리된 컴포넌트 import하여 사용, 원본 코드는 모두 제거**
3. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

**주의**: Agent.tsx는 이미 Hook으로 로직이 잘 분리되어 있어 선택적 개선 사항임. 현재 동작에 문제가 없으므로 우선순위 낮음.

---

### Phase 7 체크리스트

#### 7.1 ReRegister.tsx 리팩토링
- [ ] `components/features/auth/ReRegisterFormSection.tsx` 생성
- [ ] 기존 `EmailVerificationSection` 재사용 또는 확장 확인
- [ ] 기존 `PasswordInputSection` 재사용 확인
- [ ] ReRegister.tsx 리팩토링 및 통합
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 완료

#### 7.2 RestaurantList.tsx 리팩토링
- [ ] `components/features/restaurant/RestaurantMapModal.tsx` 생성
- [ ] `components/features/restaurant/RestaurantListHeader.tsx` 생성
- [ ] RestaurantList.tsx 리팩토링 및 통합
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 완료

#### 7.3 Agent.tsx 리팩토링 (선택적)
- [ ] `components/features/menu/MenuRecommendationSection.tsx` 생성 (선택적)
- [ ] `components/features/restaurant/AiRecommendationSection.tsx` 생성 (선택적)
- [ ] `components/features/restaurant/RestaurantSearchSection.tsx` 생성 (선택적)
- [ ] Agent.tsx 리팩토링 및 통합 (선택적)
- [ ] 빌드 성공 확인 (선택적)
- [ ] 기능 테스트 완료 (선택적)

---

### Phase 8: 중복 코드 통합 및 재사용 컴포넌트 생성

**목표**: 리팩토링 과정에서 발생한 중복 코드를 통합하고 재사용 가능한 컴포넌트를 생성하여 유지보수성 향상

**원칙**:
- 기존 컴포넌트를 재사용하거나 확장하여 중복 제거
- 새로운 공통 컴포넌트 생성 시 기존 패턴과 일관성 유지
- Props 인터페이스는 기존 사용처와 호환되도록 유지
- 각 통합 후 빌드 및 기능 테스트 필수

**통합 대상**:

#### 8.1 ReRegisterEmailVerificationSection 통합

**문제**: `ReRegisterEmailVerificationSection`과 `EmailVerificationSection`이 거의 동일한 UI 구조를 가짐 (약 90% 중복)

**해결 방안**:
1. `useEmailVerification` Hook에 `verificationType` 파라미터 추가 (`'SIGNUP' | 'RE_REGISTER'`)
2. 재가입의 경우 이메일 중복 확인 스킵 로직 추가
3. `ReRegisterEmailVerificationSection` 제거하고 `EmailVerificationSection` 재사용
4. `ReRegister.tsx`에서 `useEmailVerification` Hook 사용하도록 수정

**작업 순서**:
1. `useEmailVerification` Hook에 `verificationType` 파라미터 추가
2. 재가입 타입일 때 이메일 중복 확인 스킵 로직 추가
3. `ReRegister.tsx`에서 `useEmailVerification` Hook 사용
4. `EmailVerificationSection` 재사용
5. `ReRegisterEmailVerificationSection.tsx` 파일 삭제
6. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정
7. **기능 테스트**: 재가입 플로우 전체 테스트

---

#### 8.2 formatSeconds 함수 중복 제거

**문제**: `formatSeconds` 함수가 `ReRegister.tsx`와 `useEmailVerification.ts`에 중복 존재

**해결 방안**:
1. `ReRegister.tsx`에서 `formatSeconds` 함수 제거
2. `useEmailVerification` Hook의 `formatSeconds` 함수 재사용

**작업 순서**:
1. `ReRegister.tsx`에서 `formatSeconds` 함수 제거
2. `useEmailVerification` Hook의 `formatSeconds` 사용
3. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

---

#### 8.3 모달 닫기 버튼 통합

**문제**: 8개 모달 컴포넌트에서 동일한 닫기 버튼 SVG 아이콘과 스타일 반복

**해결 방안**:
1. `components/common/ModalCloseButton.tsx` 컴포넌트 생성
2. 모든 모달에서 공통 컴포넌트 사용

**작업 순서**:
1. `components/common/ModalCloseButton.tsx` 생성
2. 각 모달 컴포넌트에서 닫기 버튼을 공통 컴포넌트로 교체:
   - `RestaurantMapModal.tsx`
   - `PlaceDetailsModal.tsx`
   - `MenuSelectionEditModal.tsx`
   - `AddressAddModal.tsx`
   - `AddressListModal.tsx`
   - `PreferencesEditModal.tsx`
   - `MenuSelectionModal.tsx`
   - `HistoryItem.tsx` (내부 모달)
3. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정
4. **기능 테스트**: 각 모달의 닫기 기능 테스트

---

#### 8.4 body 스크롤 방지 Hook 생성

**문제**: `AddressRegistrationModal.tsx`와 `InitialSetupModal.tsx`에서 동일한 body 스크롤 방지 로직 반복

**해결 방안**:
1. `hooks/useModalScrollLock.ts` Hook 생성
2. 두 모달에서 공통 Hook 사용

**작업 순서**:
1. `hooks/useModalScrollLock.ts` 생성
2. `AddressRegistrationModal.tsx`에서 Hook 사용
3. `InitialSetupModal.tsx`에서 Hook 사용
4. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정
5. **기능 테스트**: 모달 열림/닫힘 시 스크롤 동작 테스트

---

#### 8.5 주소 검색 UI 통합

**문제**: `InitialSetupAddressSection.tsx`, `AddressAddModal.tsx`, `AddressRegistrationModal.tsx`에서 거의 동일한 주소 검색 UI 반복

**해결 방안**:
1. `components/common/AddressSearchInput.tsx` 컴포넌트 생성
2. `components/common/AddressSearchResults.tsx` 컴포넌트 생성
3. 세 곳에서 공통 컴포넌트 사용

**작업 순서**:
1. `components/common/AddressSearchInput.tsx` 생성 (검색 입력 필드)
2. `components/common/AddressSearchResults.tsx` 생성 (검색 결과 리스트)
3. `InitialSetupAddressSection.tsx`에서 공통 컴포넌트 사용
4. `AddressAddModal.tsx`에서 공통 컴포넌트 사용
5. `AddressRegistrationModal.tsx`에서 공통 컴포넌트 사용
6. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정
7. **기능 테스트**: 각 위치에서 주소 검색 기능 테스트

---

#### 8.6 formatDate 함수 중복 제거

**문제**: `MenuSelectionHistory.tsx`와 `RecommendationHistory.tsx`에 각각 다른 형식의 `formatDate` 함수가 중복 존재

**해결 방안**:
1. `utils/format.ts`에 한국어 로케일 포맷 함수 추가 (`formatDateKorean`, `formatDateTimeKorean`)
2. 두 파일에서 로컬 `formatDate` 함수 제거하고 유틸 함수 사용

**작업 순서**:
1. `utils/format.ts`에 한국어 로케일 포맷 함수 추가
2. `MenuSelectionHistory.tsx`에서 로컬 `formatDate` 제거 및 유틸 함수 사용
3. `RecommendationHistory.tsx`에서 로컬 `formatDate` 제거 및 유틸 함수 사용
4. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

---

#### 8.7 에러 메시지 추출 로직 통합

**문제**: `authSlice.ts`의 `getErrorMessage`와 `utils/error.ts`의 `extractErrorMessage`가 유사한 로직 중복

**해결 방안**:
1. `authSlice.ts`에서 `getErrorMessage` 함수 제거
2. `extractErrorMessage`를 import하여 사용

**작업 순서**:
1. `authSlice.ts`에서 `getErrorMessage` 함수 제거
2. `extractErrorMessage` import 추가
3. `getErrorMessage` 호출을 `extractErrorMessage`로 변경
4. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

---

#### 8.8 OAuth 리다이렉트 로딩 UI 통합

**문제**: `OAuthKakaoRedirect.tsx`와 `OAuthGoogleRedirect.tsx`에 거의 동일한 로딩 UI 중복 (색상만 다름)

**해결 방안**:
1. `components/common/OAuthLoadingScreen.tsx` 컴포넌트 생성
2. 두 파일에서 공통 컴포넌트 사용

**작업 순서**:
1. `components/common/OAuthLoadingScreen.tsx` 생성 (provider 타입을 props로 받아 색상 결정)
2. `OAuthKakaoRedirect.tsx`에서 공통 컴포넌트 사용
3. `OAuthGoogleRedirect.tsx`에서 공통 컴포넌트 사용
4. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

---

#### 8.9 로딩 스피너 통합 (선택적)

**문제**: 여러 컴포넌트에서 동일한 로딩 스피너 스타일 반복

**해결 방안**:
1. `components/common/LoadingSpinner.tsx` 컴포넌트 생성
2. 필요한 위치에서 공통 컴포넌트 사용

**작업 순서** (선택적):
1. `components/common/LoadingSpinner.tsx` 생성
2. 주요 위치에서 공통 컴포넌트로 교체
3. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

**주의**: shadcn/ui 적용 시 자동으로 해결될 수 있으므로 선택적

---

### Phase 8 체크리스트

#### 8.1 ReRegisterEmailVerificationSection 통합
- [ ] `useEmailVerification` Hook에 `verificationType` 파라미터 추가
- [ ] 재가입 타입일 때 이메일 중복 확인 스킵 로직 추가
- [ ] `ReRegister.tsx`에서 `useEmailVerification` Hook 사용
- [ ] `EmailVerificationSection` 재사용
- [ ] `ReRegisterEmailVerificationSection.tsx` 파일 삭제
- [ ] 빌드 성공 확인
- [ ] 재가입 플로우 기능 테스트 완료

#### 8.2 formatSeconds 함수 중복 제거
- [ ] `ReRegister.tsx`에서 `formatSeconds` 함수 제거
- [ ] `useEmailVerification` Hook의 `formatSeconds` 재사용
- [ ] 빌드 성공 확인

#### 8.3 모달 닫기 버튼 통합
- [ ] `components/common/ModalCloseButton.tsx` 생성
- [ ] 8개 모달 컴포넌트에서 공통 컴포넌트 사용
- [ ] 빌드 성공 확인
- [ ] 각 모달 닫기 기능 테스트 완료

#### 8.4 body 스크롤 방지 Hook 생성
- [ ] `hooks/useModalScrollLock.ts` 생성
- [ ] `AddressRegistrationModal.tsx`에서 Hook 사용
- [ ] `InitialSetupModal.tsx`에서 Hook 사용
- [ ] 빌드 성공 확인
- [ ] 모달 스크롤 동작 테스트 완료

#### 8.5 주소 검색 UI 통합
- [ ] `components/common/AddressSearchInput.tsx` 생성
- [ ] `components/common/AddressSearchResults.tsx` 생성
- [ ] `InitialSetupAddressSection.tsx`에서 공통 컴포넌트 사용
- [ ] `AddressAddModal.tsx`에서 공통 컴포넌트 사용
- [ ] `AddressRegistrationModal.tsx`에서 공통 컴포넌트 사용
- [ ] 빌드 성공 확인
- [ ] 각 위치에서 주소 검색 기능 테스트 완료

#### 8.6 로딩 스피너 통합 (선택적)
- [ ] `components/common/LoadingSpinner.tsx` 생성 (선택적)
- [ ] 주요 위치에서 공통 컴포넌트로 교체 (선택적)
- [ ] 빌드 성공 확인 (선택적)

#### 8.10 useAddressManagement Hook 분리
- [x] `hooks/useAddressList.ts` 생성 (주소 리스트 관리)
- [x] `hooks/useAddressModal.ts` 생성 (주소 추가/수정 모달 관리)
- [x] `MyPage.tsx`에서 두 Hook 사용하도록 수정
- [x] `useAddressManagement.ts` 파일 삭제
- [x] 빌드 성공 확인

**작업 내용**:
- `useAddressManagement` Hook이 27개의 리턴값을 가지고 있어 관심사별로 분리
- 주소 리스트 관리 (`useAddressList`): 13개 리턴값
  - 주소 리스트 조회, 기본 주소 설정, 삭제 등
- 주소 추가/수정 모달 관리 (`useAddressModal`): 14개 리턴값
  - 주소 검색, 선택, 추가 등
- `MyPage.tsx`에서 두 Hook을 독립적으로 사용하도록 변경

---

### Phase 9: shadcn/ui 디자인 마이그레이션

**목표**: 로직은 그대로 유지하고 UI만 shadcn/ui 컴포넌트로 교체

**원칙**:
- Props 인터페이스와 동작은 변경하지 않음
- 내부 구현만 shadcn/ui 컴포넌트로 교체
- 서비스에 맞게 스타일 커스터마이징

**마이그레이션 대상**:

1. **모달 컴포넌트 → Dialog**
   - `StatusPopupCard` → shadcn/ui Dialog 사용
   - `AuthPromptModal` → shadcn/ui Dialog 사용
   - `InitialSetupModal` → shadcn/ui Dialog 사용
   - `AddressRegistrationModal` → shadcn/ui Dialog 사용
   - 기타 모달들도 동일하게 교체

2. **Input 필드 → shadcn/ui Input**
   - 기존 input 태그를 shadcn/ui Input으로 교체
   - 스타일은 기존과 유사하게 유지

3. **Button (선택적)**
   - 기존 Button은 프로젝트 전용 스타일이므로 유지 가능
   - 또는 shadcn/ui Button으로 교체하고 variant로 커스터마이징

4. **Form 요소들**
   - Select, Checkbox, Radio 등 필요한 컴포넌트 추가
   - 기존 폼 요소를 shadcn/ui로 교체

**작업 순서**:
1. 필요한 shadcn/ui 컴포넌트 추가 (`npx shadcn@latest add dialog`, `add select` 등)
2. 기존 컴포넌트 내부를 shadcn/ui로 교체 (Props 인터페이스는 그대로)
3. 스타일 커스터마이징 (기존 디자인과 유사하게)
4. 기능 테스트 (동작 확인)
5. **빌드 및 타입 체크**: `npm run build` 실행하여 TypeScript 컴파일 에러 확인 및 수정

**예시: StatusPopupCard 마이그레이션**
```typescript
// 기존: 커스텀 모달
<div className="fixed inset-0 z-[100]...">
  <div className="...">
    {/* 내용 */}
  </div>
</div>

// 변경 후: shadcn/ui Dialog 사용 (Props는 동일)
<Dialog open={open} onOpenChange={(open) => !open && onConfirm()}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{message}</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onClick={onConfirm}>{confirmLabel}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**주의사항**:
- Props 인터페이스 변경 금지 (기존 사용처에 영향 없도록)
- 동작 변경 금지 (onConfirm, onClose 등 동일하게 작동)
- 점진적 교체 (한 번에 하나씩)
- 각 교체 후 기능 테스트 필수

---

### Phase 9 체크리스트
- [ ] shadcn/ui Dialog 추가
- [ ] shadcn/ui Select 추가 (필요시)
- [ ] shadcn/ui Checkbox 추가 (필요시)
- [ ] StatusPopupCard → Dialog로 마이그레이션
- [ ] AuthPromptModal → Dialog로 마이그레이션
- [ ] InitialSetupModal → Dialog로 마이그레이션
- [ ] AddressRegistrationModal → Dialog로 마이그레이션
- [ ] Input 필드들을 shadcn/ui Input으로 교체
- [ ] 스타일 커스터마이징 (기존 디자인 유지)
- [ ] 기능 테스트 완료
- [ ] 빌드 성공 확인

