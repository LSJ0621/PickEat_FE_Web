# 실무 프로젝트 구조 가이드

## 📁 폴더 구조 및 역할

### 1. **api/** - API 관리
**역할**: 모든 API 호출을 체계적으로 관리

#### `api/client.ts`
- Axios 인스턴스 생성 및 설정
- 인터셉터 설정 (요청/응답 전처리)
- 기본 URL, 타임아웃 등 설정
- **왜 필요한가?**: 모든 API 호출에 공통으로 적용할 설정을 한 곳에서 관리

#### `api/endpoints.ts`
- 모든 API 엔드포인트를 상수로 정의
- **왜 필요한가?**: 
  - 엔드포인트 변경 시 한 곳만 수정
  - 오타 방지
  - 타입 안정성

#### `api/services/`
- 도메인별로 API 함수 분리
- 예: `auth.ts`, `menu.ts`, `order.ts`
- **왜 필요한가?**: 
  - 관련 API를 그룹화
  - 재사용성 향상
  - 테스트 용이

---

### 2. **components/** - 컴포넌트 관리
**역할**: 재사용 가능한 UI 컴포넌트

#### `components/common/`
- 프로젝트 전반에서 사용하는 공통 컴포넌트
- 예: Button, Input, Modal, Layout
- **구조**: 각 컴포넌트는 폴더로 관리
  ```
  Button/
    ├── Button.tsx
    ├── Button.test.tsx
    └── index.ts
  ```

#### `components/features/`
- 특정 기능에만 사용하는 컴포넌트
- 예: MenuCard, CartItem
- **왜 분리?**: 
  - 공통 컴포넌트와 기능 컴포넌트 구분
  - 유지보수 용이

---

### 3. **pages/** - 페이지 컴포넌트
**역할**: 각 라우트에 대응하는 페이지

- `Home.tsx`, `Login.tsx`, `Menu.tsx` 등
- 주로 다른 컴포넌트들을 조합
- **특징**: 
  - 라우트와 1:1 대응
  - 비즈니스 로직 최소화 (컴포넌트 조합 중심)

---

### 4. **store/** - 상태 관리 (Redux)
**역할**: 전역 상태 관리

#### `store/index.ts`
- Redux store 설정
- 모든 reducer 통합
- **중요**: 타입 정의 (`RootState`, `AppDispatch`)

#### `store/hooks.ts`
- Typed hooks 생성
- `useAppDispatch`, `useAppSelector`
- **왜 필요한가?**: TypeScript에서 타입 안전하게 사용

#### `store/slices/`
- 도메인별 Redux slice
- 예: `authSlice.ts`, `menuSlice.ts`
- **구조**: 
  - State 정의
  - Reducers 정의
  - Actions export

---

### 5. **routes/** - 라우팅 관리
**역할**: 모든 라우트를 한 곳에서 관리

#### `routes/index.tsx`
- 모든 라우트 정의
- `createBrowserRouter` 사용
- **왜 필요한가?**: 
  - 라우트 구조를 한눈에 파악
  - 중앙 집중식 관리

#### `routes/ProtectedRoute.tsx`
- 인증이 필요한 라우트 보호
- **사용법**: 
  ```tsx
  <ProtectedRoute>
    <Menu />
  </ProtectedRoute>
  ```

---

### 6. **hooks/** - Custom Hooks
**역할**: 재사용 가능한 로직을 Hook으로 분리

- `useAuth.ts`: 인증 관련 로직
- `useLocalStorage.ts`: LocalStorage 관리
- `useDebounce.ts`: 디바운스 처리
- **왜 필요한가?**: 
  - 로직 재사용
  - 컴포넌트 코드 간결화
  - 테스트 용이

---

### 7. **utils/** - 유틸리티 함수
**역할**: 순수 함수들 (부수 효과 없음)

#### `utils/constants.ts`
- 하드코딩된 값들을 상수로 관리
- 예: API URL, 에러 메시지, 검증 규칙
- **왜 필요한가?**: 
  - 매직 넘버/문자열 제거
  - 유지보수성 향상
  - 오타 방지

#### `utils/format.ts`
- 포맷팅 함수
- 예: 날짜, 숫자, 가격 포맷팅
- **특징**: 순수 함수 (입력 → 출력)

#### `utils/validation.ts`
- 검증 함수
- 예: 이메일, 비밀번호 검증
- **특징**: 재사용 가능한 검증 로직

---

### 8. **types/** - 타입 정의
**역할**: TypeScript 타입/인터페이스 정의

- `types/auth.ts`: 인증 관련 타입
- `types/common.ts`: 공통 타입
- `types/api.ts`: API 응답 타입
- **왜 필요한가?**: 
  - 타입 안정성
  - 자동완성 지원
  - 문서화 효과

---

### 9. **styles/** - 스타일 관리 (선택)
**역할**: 전역 스타일, 테마 설정

- `styles/globals.css`: 전역 스타일
- `styles/theme.ts`: 테마 설정 (색상, 폰트 등)
- **참고**: Tailwind 사용 시 `tailwind.config.js`에서 관리

---

## 🔑 핵심 원칙

### 1. **관심사의 분리 (Separation of Concerns)**
- 각 폴더는 명확한 역할을 가짐
- 관련된 코드를 한 곳에 모음

### 2. **재사용성 (Reusability)**
- 공통 컴포넌트, 유틸리티 함수는 재사용 가능하게 설계
- Custom Hook으로 로직 재사용

### 3. **유지보수성 (Maintainability)**
- 상수, 타입, 엔드포인트를 한 곳에서 관리
- 변경 시 영향 범위 최소화

### 4. **확장성 (Scalability)**
- 도메인별로 폴더/파일 분리
- 새로운 기능 추가 시 구조 유지

### 5. **타입 안정성 (Type Safety)**
- TypeScript 타입 정의
- Typed hooks 사용

---

## 📝 파일별 관리 사항

| 파일/폴더 | 관리하는 것 | 왜 중요한가? |
|---------|-----------|------------|
| `api/endpoints.ts` | 모든 API 엔드포인트 | 변경 시 한 곳만 수정 |
| `utils/constants.ts` | 하드코딩된 값들 | 유지보수성 향상 |
| `types/` | 타입 정의 | 타입 안정성 |
| `store/slices/` | 전역 상태 | 상태 관리 중앙화 |
| `routes/index.tsx` | 라우트 정의 | 라우팅 구조 파악 |
| `components/common/` | 공통 컴포넌트 | 재사용성 향상 |

---

## 🚀 사용 예시

### API 호출
```tsx
import { authService } from '@/api/services/auth';
import { ENDPOINTS } from '@/api/endpoints';

// 사용
const response = await authService.login({ email, password });
```

### 상태 관리
```tsx
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';

const user = useAppSelector(state => state.auth.user);
const dispatch = useAppDispatch();
```

### 유틸리티 사용
```tsx
import { formatPrice, formatDate } from '@/utils/format';
import { VALIDATION, ERROR_MESSAGES } from '@/utils/constants';

const price = formatPrice(10000); // "10,000원"
```

### 라우팅
```tsx
// routes/index.tsx에서 관리
<Route path="/menu" element={<Menu />} />
```

---

## 💡 실무 팁

1. **절대 경로 사용**: `@/` alias 설정 (vite.config.ts)
2. **index.ts 활용**: 폴더 내에서 export 정리
3. **네이밍 규칙**: 
   - 컴포넌트: PascalCase
   - 함수/변수: camelCase
   - 상수: UPPER_SNAKE_CASE
4. **파일 크기**: 한 파일은 200줄 이내 권장
5. **폴더 깊이**: 3-4단계 이내 권장

