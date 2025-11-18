# 📚 실무 프로젝트 구조 완성 가이드

## ✅ 완성된 구조

실무에서 사용하는 표준 프로젝트 구조가 설정되었습니다.

## 📁 생성된 폴더 구조

```
src/
├── api/                    ✅ API 관리
│   ├── client.ts          # Axios 설정 및 인터셉터
│   ├── endpoints.ts        # 모든 엔드포인트 상수
│   └── services/          # 도메인별 API 함수
│       └── auth.ts
│
├── components/            ✅ 컴포넌트
│   └── common/            # 공통 컴포넌트
│       └── Button/        # 예시 컴포넌트
│
├── store/                ✅ Redux 상태 관리
│   ├── index.ts          # Store 설정
│   ├── hooks.ts          # Typed hooks
│   └── slices/           # Redux slices
│       └── authSlice.example.ts
│
├── routes/               ✅ 라우팅
│   ├── index.tsx         # 라우트 정의
│   └── ProtectedRoute.tsx # 보호된 라우트
│
├── hooks/                ✅ Custom Hooks
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
│
├── utils/                ✅ 유틸리티
│   ├── constants.ts      # 상수 관리
│   ├── format.ts         # 포맷팅 함수
│   └── validation.ts    # 검증 함수
│
├── types/                ✅ 타입 정의
│   ├── auth.ts
│   └── common.ts
│
└── App.tsx               ✅ 메인 컴포넌트
```

## 🔑 핵심 파일별 역할

### 1. **라우팅 관리** → `routes/index.tsx`
```tsx
// 모든 라우트를 한 곳에서 관리
const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
]);
```

**왜 중요한가?**
- 라우트 구조를 한눈에 파악
- 라우트 변경 시 한 곳만 수정
- 중앙 집중식 관리

---

### 2. **상태 관리** → `store/`
```tsx
// store/index.ts - Store 설정
export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
  },
});

// store/hooks.ts - Typed hooks
export const useAppSelector = useSelector;
export const useAppDispatch = useDispatch;
```

**왜 중요한가?**
- 전역 상태를 중앙에서 관리
- 타입 안전성 보장
- 디버깅 용이 (Redux DevTools)

---

### 3. **API 관리** → `api/`
```tsx
// api/endpoints.ts - 엔드포인트 상수
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
  },
};

// api/services/auth.ts - API 함수
export const authService = {
  login: async (data) => {
    return await apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
  },
};
```

**왜 중요한가?**
- 엔드포인트 변경 시 한 곳만 수정
- 인터셉터로 공통 처리 (토큰, 에러)
- 재사용성 향상

---

### 4. **상수 관리** → `utils/constants.ts`
```tsx
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

export const ERROR_MESSAGES = {
  REQUIRED: '필수 입력 항목입니다.',
} as const;
```

**왜 중요한가?**
- 하드코딩된 값 제거
- 오타 방지
- 유지보수성 향상

---

### 5. **타입 관리** → `types/`
```tsx
// types/auth.ts
export interface User {
  id: string;
  email: string;
}
```

**왜 중요한가?**
- 타입 안정성
- 자동완성 지원
- 문서화 효과

---

### 6. **유틸리티 함수** → `utils/`
```tsx
// utils/format.ts
export const formatPrice = (price: number) => {
  return `${formatNumber(price)}원`;
};
```

**왜 중요한가?**
- 재사용 가능한 로직
- 테스트 용이
- 컴포넌트 코드 간결화

---

### 7. **Custom Hooks** → `hooks/`
```tsx
// hooks/useLocalStorage.ts
export function useLocalStorage(key, initialValue) {
  // LocalStorage 관리 로직
}
```

**왜 중요한가?**
- 로직 재사용
- 컴포넌트와 로직 분리
- 테스트 용이

---

## 🚀 사용 방법

### 절대 경로 사용
```tsx
// ✅ 좋은 예
import { Button } from '@/components/common/Button';
import { authService } from '@/api/services/auth';
import { formatPrice } from '@/utils/format';

// ❌ 나쁜 예
import { Button } from '../../../components/common/Button';
```

### API 호출
```tsx
import { authService } from '@/api/services/auth';
import { ENDPOINTS } from '@/api/endpoints';

const handleLogin = async () => {
  const response = await authService.login({ email, password });
};
```

### 상태 관리
```tsx
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';

const user = useAppSelector(state => state.auth.user);
const dispatch = useAppDispatch();
```

### 상수 사용
```tsx
import { STORAGE_KEYS, ERROR_MESSAGES } from '@/utils/constants';

localStorage.setItem(STORAGE_KEYS.TOKEN, token);
console.log(ERROR_MESSAGES.REQUIRED);
```

---

## 📝 다음 단계

1. **Redux Slice 추가**
   - `store/slices/authSlice.example.ts`를 `authSlice.ts`로 복사
   - `store/index.ts`에서 reducer 등록

2. **페이지 컴포넌트 생성**
   - `pages/Home.tsx`, `pages/Login.tsx` 등 생성
   - `routes/index.tsx`에 라우트 추가

3. **API 서비스 확장**
   - `api/services/menu.ts`, `api/services/order.ts` 등 추가

4. **공통 컴포넌트 확장**
   - `components/common/Input/`, `components/common/Modal/` 등 추가

---

## 💡 실무 팁

1. **파일 크기**: 한 파일은 200줄 이내 권장
2. **폴더 깊이**: 3-4단계 이내 권장
3. **네이밍**: 
   - 컴포넌트: PascalCase
   - 함수/변수: camelCase
   - 상수: UPPER_SNAKE_CASE
4. **index.ts 활용**: 폴더 내에서 export 정리

---

## 📖 더 자세한 설명

- `STRUCTURE_GUIDE.md` - 상세한 구조 가이드
- `PROJECT_STRUCTURE.md` - 폴더 구조 설명

