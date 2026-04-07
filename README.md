# PickEat

AI 기반 음식 추천 웹 애플리케이션

![PickEat 개요](./docs/images/개요%20사진.png)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)


---

## 아키텍처

![PickEat Architecture](./docs/images/pickeat_architecture_dark.png)

| 레이어 | 기술 |
|--------|------|
| Client | Browser (React 19, Vite, SPA) |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway (NestJS 11, TypeORM, JWT, Passport, Redis, PostgreSQL 14 + PostGIS) |
| AI 추천 | OpenAI GPT-4.1 / GPT-4.1 mini, Gemini gemini-2.5-flash |
| 지도 | Google Maps (Places API, Maps JS API) |
| 소셜 로그인 | Kakao OAuth 2.0 |
| 파일 스토리지 | AWS S3 |
| 알림 | Discord Webhook |

---

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| Core | React 19, TypeScript 5.9, Vite 7 |
| 상태관리 | Redux Toolkit |
| 스타일링 | Tailwind CSS 4, shadcn/ui, Radix UI |
| 라우팅 | React Router 7 |
| HTTP | Axios (auto token refresh) |
| 지도 | Google Maps JS API |
| 애니메이션 | Framer Motion |
| 차트 | Recharts |
| 국제화 | i18next (ko, en) |
| 테스트 | Vitest, Playwright, MSW |
| 린트 | ESLint 9 |

---

## 시작하기

### Prerequisites

- Node.js >= 20.0.0
- npm

### 설치

```bash
git clone https://github.com/your-org/pickeat.git
cd pickeat/pickeat_web
npm install
```

### 환경변수 설정

`.env.example`을 복사하여 `.env.local`을 생성하고 값을 채웁니다.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE_URL` | 백엔드 API URL |
| `VITE_KAKAO_CLIENT_ID` | 카카오 OAuth 클라이언트 ID |
| `VITE_KAKAO_REDIRECT_URI` | 카카오 OAuth 리다이렉트 URI |
| `VITE_GOOGLE_CLIENT_ID` | 구글 OAuth 클라이언트 ID |
| `VITE_GOOGLE_REDIRECT_URI` | 구글 OAuth 리다이렉트 URI |
| `VITE_GOOGLE_MAPS_API_KEY` | 구글 맵 API 키 |
| `VITE_GOOGLE_MAP_ID` | 구글 맵 ID |

### 개발 서버 실행

```bash
npm run dev
# http://localhost:8080
```

---

## Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (port 8080) |
| `npm run build` | TypeScript + Vite 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run test` | 단위 테스트 (watch 모드) |
| `npm run test:run` | 단위 테스트 (1회 실행) |
| `npm run test:coverage` | 커버리지 리포트 생성 |
| `npm run test:e2e` | E2E 테스트 실행 |
| `npm run test:e2e:ui` | E2E 테스트 UI 모드 |

---

## 프로젝트 구조

```
src/
├── app/              # 앱 쉘 (라우팅, 스토어, 레이아웃, 프로바이더)
├── features/         # 도메인별 기능 모듈
│   ├── agent/        # AI 추천 에이전트
│   ├── auth/         # 인증 (로그인, 회원가입, OAuth)
│   ├── home/         # 홈 페이지
│   ├── map/          # 지도 페이지
│   ├── history/      # 추천/메뉴/평가 이력
│   ├── rating/       # 장소 평가
│   ├── user/         # 프로필, 주소, 선호도
│   ├── user-place/   # 사용자 등록 장소
│   ├── bug-report/   # 버그 신고
│   ├── onboarding/   # 온보딩 플로우
│   └── admin/        # 관리자 대시보드
├── shared/           # 공유 코드
│   ├── api/          # Axios 클라이언트, 엔드포인트
│   ├── components/   # 재사용 UI 컴포넌트
│   ├── hooks/        # 공유 커스텀 훅
│   ├── types/        # 공유 타입
│   ├── ui/           # shadcn/ui 컴포넌트
│   └── utils/        # 유틸리티 함수
├── i18n/             # 국제화 설정
├── locales/          # 번역 파일 (ko, en)
└── styles/           # 전역 스타일
```

### Feature 모듈 패턴

각 도메인 기능은 아래 구조를 따릅니다.

```
features/{domain}/
├── pages/        # 라우트 페이지 컴포넌트
├── components/   # 기능별 컴포넌트
├── hooks/        # 기능별 커스텀 훅
├── api.ts        # API 서비스 함수
├── types.ts      # TypeScript 타입
└── index.ts      # Barrel export
```

---

## 페이지

| 경로 | 페이지 | 접근 권한 |
|------|--------|----------|
| `/` | 홈 | 공개 |
| `/agent` | AI 추천 | 로그인 필수 |
| `/map` | 지도 | 로그인 필수 |
| `/login` | 로그인 | 공개 |
| `/register` | 회원가입 | 공개 |
| `/mypage` | 마이페이지 | 로그인 필수 |
| `/mypage/profile` | 프로필 편집 | 로그인 필수 |
| `/mypage/preferences` | 선호도 설정 | 로그인 필수 |
| `/mypage/address` | 주소 관리 | 로그인 필수 |
| `/user-places` | 내 장소 | 로그인 필수 |
| `/recommendations/history` | 추천 이력 | 로그인 필수 |
| `/menu-selections/history` | 메뉴 선택 이력 | 로그인 필수 |
| `/ratings/history` | 평가 이력 | 로그인 필수 |
| `/bug-report` | 버그 신고 | 로그인 필수 |
| `/admin/*` | 관리자 | 관리자 전용 |
