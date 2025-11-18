# 실무 프로젝트 구조 가이드

## 📁 권장 폴더 구조

```
src/
├── api/                    # API 호출 관련
│   ├── client.ts          # Axios 인스턴스 설정
│   ├── endpoints.ts       # API 엔드포인트 정의
│   └── services/          # 각 도메인별 API 함수
│       ├── auth.ts
│       ├── menu.ts
│       └── order.ts
│
├── components/            # 재사용 가능한 컴포넌트
│   ├── common/            # 공통 컴포넌트
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Layout/
│   └── features/         # 기능별 컴포넌트
│       ├── auth/
│       ├── menu/
│       └── cart/
│
├── pages/                # 페이지 컴포넌트
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Menu.tsx
│   └── Cart.tsx
│
├── store/                # Redux 상태 관리
│   ├── index.ts          # Store 설정
│   ├── hooks.ts          # Typed hooks
│   └── slices/           # Redux slices
│       ├── authSlice.ts
│       ├── menuSlice.ts
│       └── cartSlice.ts
│
├── routes/               # 라우팅 설정
│   ├── index.tsx         # 라우트 정의
│   └── ProtectedRoute.tsx # 보호된 라우트
│
├── hooks/                # Custom Hooks
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
│
├── utils/                # 유틸리티 함수
│   ├── format.ts         # 포맷팅 함수
│   ├── validation.ts     # 검증 함수
│   └── constants.ts      # 상수 정의
│
├── types/                # TypeScript 타입 정의
│   ├── api.ts
│   ├── auth.ts
│   └── common.ts
│
├── styles/               # 스타일 관련
│   ├── globals.css       # 전역 스타일
│   └── theme.ts          # 테마 설정 (선택)
│
├── assets/               # 정적 파일
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── App.tsx               # 메인 App 컴포넌트
├── main.tsx              # 진입점
└── index.css             # Tailwind 지시문
```

## 📝 각 폴더의 역할

### 1. api/ - API 관리
- **client.ts**: Axios 인스턴스 설정 (인터셉터, 기본 URL 등)
- **endpoints.ts**: 모든 API 엔드포인트를 한 곳에서 관리
- **services/**: 도메인별 API 함수 분리

### 2. components/ - 컴포넌트 관리
- **common/**: 프로젝트 전반에서 사용하는 공통 컴포넌트
- **features/**: 특정 기능에만 사용하는 컴포넌트

### 3. pages/ - 페이지 컴포넌트
- 각 라우트에 대응하는 페이지 컴포넌트
- 주로 다른 컴포넌트들을 조합

### 4. store/ - 상태 관리
- **index.ts**: Redux store 설정
- **hooks.ts**: Typed hooks (useAppDispatch, useAppSelector)
- **slices/**: 각 도메인별 Redux slice

### 5. routes/ - 라우팅 관리
- **index.tsx**: 모든 라우트 정의를 한 곳에서 관리
- **ProtectedRoute.tsx**: 인증이 필요한 라우트 보호

### 6. hooks/ - Custom Hooks
- 재사용 가능한 로직을 Hook으로 분리

### 7. utils/ - 유틸리티 함수
- 순수 함수들 (포맷팅, 검증, 변환 등)
- **constants.ts**: 하드코딩된 값들을 상수로 관리

### 8. types/ - 타입 정의
- TypeScript 타입/인터페이스 정의
- 도메인별로 파일 분리

### 9. styles/ - 스타일 관리
- 전역 스타일, 테마 설정
- Tailwind 커스터마이징

