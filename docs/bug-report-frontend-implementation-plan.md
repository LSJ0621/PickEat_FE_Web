# 버그 신고 기능 프론트엔드 구현 계획

> **목표**: 유저용 버그 제보 작성 페이지 + 관리자용 버그 제보 관리 페이지  
> **API**: `POST /bug-reports`, `GET /admin/bug-reports`, `GET /admin/bug-reports/:id`, `PATCH /admin/bug-reports/:id/status`

---

## 🎯 기능 요구사항

### 유저 기능
- **경로**: `/bug-report` (로그인 필수)
- **접근 방법**: 
  - 푸터 네비게이션에 "버그 제보" 버튼 추가 (로그인 필수)
  - 역할별 자동 라우팅:
    - 일반 유저: `/bug-report` (버그 제보 작성 페이지)
    - 관리자: `/admin/bug-reports` (버그 제보 목록 페이지)
- **입력**: 카테고리(라디오 버튼), 제목(30자), 상세(500자), 이미지(최대 5장, 5MB)
- **플로우**: 유효성 검증 → API 호출 → 성공/에러 처리

### 관리자 기능
- **경로**: `/admin/bug-reports` (관리자 권한 필수)
- **목록**: 미확인 기본, 상태/날짜 필터, 페이지네이션(20개)
- **상세**: 모달로 표시, 이미지 갤러리, 상태 변경(미확인→확인)

---

## 📁 파일 구조

```
src/
├── types/bug-report.ts                    # 타입 정의
├── api/
│   ├── endpoints.ts                        # 엔드포인트 추가
│   └── services/bug-report.ts              # API 서비스 (신규)
├── pages/
│   ├── bug-report/BugReportPage.tsx       # 유저용 페이지 (신규)
│   └── admin/bug-reports/
│       └── AdminBugReportListPage.tsx      # 관리자용 페이지 (신규)
├── components/features/
│   ├── bug-report/
│   │   ├── BugReportForm.tsx             # 폼 컴포넌트 (신규)
│   │   └── ImageUploader.tsx              # 이미지 업로더 (신규)
│   └── admin/bug-reports/
│       ├── BugReportList.tsx              # 목록 컴포넌트 (신규)
│       ├── BugReportListItem.tsx         # 목록 항목 (신규)
│       ├── BugReportFilters.tsx          # 필터 컴포넌트 (신규)
│       ├── BugReportDetailModal.tsx      # 상세 모달 (신규)
│       └── BugReportImageGallery.tsx     # 이미지 갤러리 (신규)
└── store/slices/bugReportSlice.ts        # Redux slice (선택적, 신규)
```

---

## 🔌 API 설계

### 엔드포인트 추가 (`src/api/endpoints.ts`)

```typescript
BUG_REPORT: {
  CREATE: `${API_BASE}/bug-reports`,
},
ADMIN: {
  BUG_REPORTS: `${API_BASE}/admin/bug-reports`,
  BUG_REPORT_DETAIL: (id) => `${API_BASE}/admin/bug-reports/${id}`,
  BUG_REPORT_UPDATE_STATUS: (id) => `${API_BASE}/admin/bug-reports/${id}/status`,
}
```

### 서비스 함수 구현 (`src/api/services/bug-report.ts`)

**함수 1: 버그 제보 생성**
```typescript
createBugReport(data: CreateBugReportRequest): Promise<CreateBugReportResponse>
```
- **요청**: FormData로 multipart/form-data 전송
  - `data.category`, `data.title`, `data.description` → FormData에 문자열로 append
  - `data.images` (File[]) → 'images' 필드로 append (최대 5장, FilesInterceptor에서 처리)
  - 헤더: axios가 자동으로 `Content-Type: multipart/form-data` 설정 (명시 불필요)
  - **응답**: `{ id: number }`만 반환
  - **참고**: 백엔드는 `@Body()`로 JSON 필드, `@UploadedFiles('images')`로 파일 분리 수신
  - **구현**: `new FormData()` 생성 후 `formData.append('category', data.category)` 형태로 전송
  - **주의**: FormData 전송 시 `Content-Type` 헤더를 명시하지 않음 (axios가 자동으로 `multipart/form-data` + boundary 설정)

**함수 2: 목록 조회**
```typescript
getBugReportList(params: {
  page?: number;        // 기본값: 1, 최소값: 1
  limit?: number;       // 기본값: 20, 최소값: 1, 최대값: 50
  status?: 'UNCONFIRMED' | 'CONFIRMED';  // 없으면 미확인만 조회
  date?: string;        // 형식: 'YYYY-MM-DD' (예: '2025-12-01')
}): Promise<GetBugReportListResponse>
```

**함수 3: 상세 조회**
```typescript
getBugReportDetail(id: number | string): Promise<GetBugReportDetailResponse>
```

**함수 4: 상태 변경**
```typescript
updateBugReportStatus(id: number | string, status: 'UNCONFIRMED' | 'CONFIRMED'): Promise<BugReport>
```
- **요청 body**: `{ status: BugReportStatus }` (enum 타입)
- **참고**: 일반적으로 미확인→확인만 사용 (CONFIRMED)
- **백엔드**: `UpdateBugReportStatusDto`에서 `@IsEnum(BugReportStatus)` 검증

---

## 📝 타입 정의 (`src/types/bug-report.ts`)

```typescript
// 프론트엔드에서 제한하는 카테고리 (백엔드는 string으로만 검증)
export type BugReportCategory = 'BUG' | 'INQUIRY' | 'OTHER';
// 표시용 라벨: '버그 제보', '문의 사항', '기타'
export type BugReportStatus = 'UNCONFIRMED' | 'CONFIRMED';

export interface BugReport {
  id: number;
  userId: number;
  category: BugReportCategory;
  title: string;
  description: string;
  images: string[] | null;
  status: BugReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBugReportRequest {
  category: BugReportCategory;
  title: string;        // 최대 30자
  description: string;  // 최대 500자
  images?: File[];      // 최대 5장
}

export interface CreateBugReportResponse {
  id: number;
}

export interface GetBugReportListResponse {
  items: BugReport[];
  pageInfo: {
    page: number;
    limit: number;
    totalCount: number;
    hasNext: boolean;
  };
}

export interface GetBugReportDetailResponse extends BugReport {
  // 현재 백엔드는 유저 정보를 포함하지 않음 (userId만 포함)
  // 향후 확장 가능성을 위해 optional로 정의
  user?: {
    id: number;
    nickname?: string;
    email: string;
  };
}
```

---

## 🧩 컴포넌트 설계

### 유저용 컴포넌트

| 컴포넌트 | 책임 | 주요 Props/상태 |
|---------|------|----------------|
| `BugReportPage` | 폼 상태 관리, API 호출, 에러 처리 | `category`, `title`, `description`, `images[]`, `isSubmitting`, `errors` |
| `BugReportForm` | 폼 UI 렌더링 | `onSubmit(data, files)`, `isSubmitting`, `errors` |
| `ImageUploader` | 이미지 선택/미리보기/삭제 | `images[]`, `maxImages=5`, `onImagesChange`, `onRemove` |

**UI/UX 디자인 (버그 제보 작성 페이지)**:
- **레이아웃**: 중앙 정렬, 최대 너비 800px, 카드 스타일
- **카테고리**: 라디오 버튼 그룹 (3개 옵션 가로 배치)
- **입력 필드**: 라벨 + 입력 + 글자 수 표시 (예: "0/30")
- **이미지 업로더**: 
  - 드래그 앤 드롭 영역 (큰 박스, 아이콘 + 안내 문구)
  - 업로드된 이미지: 그리드 레이아웃 (2열), 썸네일 + 삭제 버튼 오버레이
  - "최대 5장" 안내 문구
- **제출 버튼**: 하단 고정, 로딩 상태 표시

**구현 참고**:
- 폼 패턴: `RegisterPage.tsx` 참고 (유효성 검증, 에러 처리)
- 에러 처리: `useErrorHandler` hook 사용 (`handleError`, `handleSuccess`)
- 상태 관리: 로컬 `useState` 사용

### 관리자용 컴포넌트

| 컴포넌트 | 책임 | 주요 Props |
|---------|------|-----------|
| `AdminBugReportListPage` | 목록 표시, 필터링, 페이지네이션, 권한 체크 | - |
| `BugReportList` | 목록 렌더링 | `bugReports[]`, `onItemClick`, `onStatusChange` |
| `BugReportListItem` | 개별 항목 렌더링 | `bugReport`, `onClick`, `onStatusChange` |
| `BugReportFilters` | 필터 UI | `status`, `date`, `onStatusChange`, `onDateChange`, `onReset` |
| `BugReportDetailModal` | 상세 정보 표시 | `bugReportId`, `isOpen`, `onClose`, `onStatusChange` |
| `BugReportImageGallery` | 이미지 갤러리/슬라이더 | `images[]` (S3 URL 문자열 배열) |

**UI/UX 디자인 (관리자 상세 모달)**:
- **이미지 갤러리**: 슬라이더 방식 (`PlaceDetailsModal.tsx` 패턴 참고)
  - 큰 이미지 표시 영역
  - 좌우 네비게이션 버튼
  - 하단 썸네일 인디케이터 (선택적)
  - 이미지 카운터 (예: "1/3")

**구현 참고**:
- 모달 패턴: `PlaceDetailsModal.tsx` 참고 (모달 구조, 스크롤 처리)
- 이미지 슬라이더: `PlaceDetailsModal.tsx`의 사진 슬라이드 패턴 참고
- 권한 체크: 컴포넌트 내부에서 403 에러 처리

---

## 🛣 라우팅 (`src/routes/index.tsx`)

```typescript
import BugReportPage from '@/pages/bug-report/BugReportPage';
import AdminBugReportListPage from '@/pages/admin/bug-reports/AdminBugReportListPage';

// 라우트 배열에 추가
{
  path: '/bug-report',
  element: (
    <AppLayout>
      <ProtectedRoute>
        <BugReportPage />
      </ProtectedRoute>
    </AppLayout>
  ),
},
{
  path: '/admin/bug-reports',
  element: (
    <AppLayout>
      <ProtectedRoute>
        <AdminBugReportListPage />
      </ProtectedRoute>
    </AppLayout>
  ),
}
```

**참고**: 
- `ProtectedRoute`는 `requiredRole` prop 미지원
- 관리자 권한 체크는 `AdminBugReportListPage` 내부에서 처리 (403 에러 처리)

### 유저 접근 링크 추가
- **위치**: `AppFooter`의 `navItems` 배열에 추가
- **구현**: `src/components/common/AppFooter.tsx` 수정
  ```typescript
  {
    label: '버그 제보',
    path: '/bug-report', // 기본 경로 (역할에 따라 동적으로 변경)
    requiresAuth: true,
    icon: (버그 제보 아이콘),
  }
  ```
- **역할별 라우팅**: `handleNavClick` 함수에서 role 확인 후 조건부 이동
  ```typescript
  const userRole = useAppSelector((state) => state.auth?.user?.role);
  const handleNavClick = (item: NavItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      setPendingPath(item.path);
      setShowPrompt(true);
      return;
    }
    // 버그 제보 버튼인 경우 역할에 따라 경로 분기
    if (item.path === '/bug-report') {
      const targetPath = userRole === 'ADMIN' ? '/admin/bug-reports' : '/bug-report';
      navigate(targetPath);
      return;
    }
    navigate(item.path);
  };
  ```
- **동작**: 
  - 로그인하지 않은 유저 클릭 시 `AuthPromptModal` 표시
  - 일반 유저: `/bug-report` (버그 제보 작성)
  - 관리자: `/admin/bug-reports` (버그 제보 목록)

---

## 👤 관리자 접근 방식

### 관리자 로그인
- **방식**: 일반 유저와 동일한 로그인 페이지 사용 (`/login`)
- **인증**: 이메일/비밀번호로 로그인
- **권한 확인**: JWT 토큰에서 `role` 필드 추출 (JWT 디코딩 유틸 사용)

### JWT 토큰에서 role 추출
- **유틸 함수**: `src/utils/jwt.ts` 생성
  ```typescript
  // JWT payload 디코딩
  export const decodeJwt = (token: string | null): JwtPayload | null
  
  // 토큰에서 role 추출
  export const getUserRoleFromToken = (): string | null
  ```
  - JWT 토큰의 payload 디코딩하여 `role` 필드 추출
  - `atob()`로 base64 디코딩 후 JSON 파싱
  - `getUserRoleFromToken`: localStorage의 토큰을 읽어 role 반환
- **Redux 저장**: `authSlice`에서 토큰 저장 시 role 추출하여 `user.role`에 저장
  - `setCredentials` 액션에서 토큰의 role 추출
  - `initializeAuth`에서도 토큰의 role 추출
- **User 타입**: `src/types/auth.ts`의 `User` 인터페이스에 `role?: string` 추가

### 관리자 링크 표시
- **위치**: `UserMenu` 드롭다운에 조건부 표시
- **조건**: `useAppSelector`로 `state.auth?.user?.role === 'ADMIN'` 확인
- **표시 방식**: 관리자일 때만 "문의사항 관리" 메뉴 항목 표시
- **구현 위치**: `src/components/common/UserMenu.tsx` 수정
  ```typescript
  const userRole = useAppSelector((state) => state.auth?.user?.role);
  {userRole === 'ADMIN' && (
    <button onClick={() => handleMenuItemClick('/admin/bug-reports')}>
      문의사항 관리
    </button>
  )}
  ```

### 관리자 페이지 접근 제어
- **권한 체크**: `AdminBugReportListPage` 컴포넌트 마운트 시
  - `useAppSelector`로 현재 유저의 role 확인
  - `role !== 'ADMIN'`이면 403 에러 처리 또는 리다이렉트
- **에러 처리**: 403 에러 시 Toast 알림 + 홈으로 리다이렉트 (선택적)

### 버그 제보 화면 확인
- **경로**: `/admin/bug-reports` (UserMenu에서 "문의사항 관리" 클릭 또는 직접 접근)
- **기본 동작**: 미확인 상태의 버그 제보만 표시
- **필터**: 상태(미확인/확인/전체), 날짜 필터로 조회
- **상세 확인**: 목록 항목 클릭 → 모달로 상세 정보 표시
- **상태 변경**: 상세 모달에서 "확인" 버튼 클릭 → 상태 변경 (미확인→확인)

---

## 🛡 유효성 검증

### 규칙
- **카테고리**: 필수 ('버그 제보', '문의 사항', '기타' 중 선택)
- **제목**: 필수, 1-30자 (백엔드 제한)
- **상세**: 필수, 1-500자 (백엔드 제한)
- **이미지**: 최대 5장, 각 5MB 이하, 형식: jpg/jpeg/png/gif/webp

### 구현 위치
- **유효성 검증 함수**: `src/utils/validation.ts`에 추가
  - 예: `validateBugReport(data: CreateBugReportRequest, images?: File[]): { isValid: boolean; errors: Record<string, string> }`
- **상수 정의**: `src/utils/constants.ts`에 추가
  ```typescript
  export const BUG_REPORT = {
    MAX_IMAGES: 5,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    TITLE_MAX_LENGTH: 30,
    DESCRIPTION_MAX_LENGTH: 500,
    CATEGORIES: {
      BUG: '버그 제보',
      INQUIRY: '문의 사항',
      OTHER: '기타',
    } as const,
  } as const;
  ```
- **에러 메시지**: `src/utils/constants.ts`의 `ERROR_MESSAGES`에 추가

### 에러 처리
- **API 에러**: `utils/error.ts`의 `extractErrorMessage` 사용
- **Toast 알림**: `useErrorHandler` hook 사용 (`handleError`, `handleSuccess`)
- **유효성 검증**: 각 필드 아래 에러 메시지 표시 (예: `RegisterPage.tsx` 패턴)
- **권한 에러**: 관리자 페이지에서 403 처리

---

## ✅ 구현 체크리스트

### Phase 1: 기반 설정
- [x] `src/utils/jwt.ts` 생성 (JWT 디코딩 유틸: `decodeJwt`, `getUserRoleFromToken`)
- [x] `src/types/auth.ts`의 `User` 인터페이스에 `role?: string` 추가
- [x] `src/store/slices/authSlice.ts` 수정 (토큰에서 role 추출하여 저장)
- [x] `src/types/bug-report.ts` 생성 (모든 타입 정의)
- [x] `src/api/endpoints.ts`에 엔드포인트 추가
- [x] `src/api/services/bug-report.ts` 생성 (4개 함수 구현)
- [x] `src/utils/constants.ts`에 버그 제보 관련 상수 추가
- [ ] API 호출 테스트 (Postman/브라우저 콘솔)

### Phase 2: 유저용 페이지
- [x] `src/utils/validation.ts`에 `validateBugReport` 함수 추가
- [x] `BugReportPage.tsx` 생성
  - [x] 폼 상태 관리 (`useState`)
  - [x] 유효성 검증 로직
  - [x] API 호출 (`bugReportService.createBugReport`)
  - [x] 에러 처리 (`useErrorHandler`)
- [x] `BugReportForm.tsx` 생성
  - [x] 카테고리 라디오 버튼 그룹 ('버그 제보', '문의 사항', '기타')
  - [x] 제목/상세 입력 필드 (글자 수 표시)
  - [x] 에러 메시지 표시
- [x] `ImageUploader.tsx` 생성
  - [x] 드래그 앤 드롭 영역 (큰 박스, 아이콘 + 안내 문구)
  - [x] 이미지 그리드 레이아웃 (2열, 썸네일 + 삭제 버튼 오버레이)
  - [x] 파일 형식/크기 검증
- [x] `/bug-report` 라우팅 추가
- [x] `AppFooter.tsx`에 "버그 제보" 네비게이션 항목 추가 (`requiresAuth: true`)
- [x] `AppFooter.tsx`의 `handleNavClick`에서 역할별 조건부 라우팅 구현 (ADMIN → `/admin/bug-reports`, USER → `/bug-report`)
- [x] Tailwind CSS 스타일링

### Phase 3: 관리자용 목록
- [x] `src/components/common/UserMenu.tsx` 수정 (관리자 링크 조건부 표시)
- [ ] `bugReportSlice.ts` 생성 (선택적, Redux)
- [x] `AdminBugReportListPage.tsx` 생성
  - [x] 관리자 권한 체크 (`useAppSelector`로 role 확인, ADMIN 아니면 403 처리)
  - [x] 필터 상태 관리
  - [x] 페이지네이션 상태 관리
- [x] `BugReportList.tsx` 생성
- [x] `BugReportListItem.tsx` 생성
- [x] `BugReportFilters.tsx` 생성
  - [x] 상태 필터 (미확인/확인/전체)
  - [x] 날짜 필터 (YYYY-MM-DD)
  - [x] 필터 초기화
- [x] 페이지네이션 구현
- [x] `/admin/bug-reports` 라우팅 추가
- [x] 스타일링

### Phase 4: 관리자용 상세
- [x] `BugReportDetailModal.tsx` 생성
  - [x] 모달 구조 (`PlaceDetailsModal.tsx` 참고)
  - [x] 상세 정보 표시
  - [x] 상태 변경 버튼
- [x] `BugReportImageGallery.tsx` 생성
  - [x] 이미지 슬라이더 (`PlaceDetailsModal`의 사진 슬라이드 패턴 참고)
  - [x] 이미지 네비게이션
- [x] 상태 변경 기능 구현
  - [x] API 호출 (`bugReportService.updateBugReportStatus`)
  - [x] Toast 알림 (`useErrorHandler`)
  - [x] 목록 갱신

### Phase 5: 최적화
- [x] 에러 처리 강화
  - [x] 네트워크 에러 구체적 메시지 처리
  - [x] 이미지 크기 초과 에러 처리 (413)
- [x] 로딩 상태 개선 (스켈레톤 UI)
  - [x] `BugReportListSkeleton.tsx` 생성
  - [x] 목록 로딩 시 스켈레톤 UI 표시
- [x] 성능 최적화
  - [x] 이미지 lazy loading (`loading="lazy"`, `decoding="async"`)
  - [x] `BugReportListItem` 메모이제이션 (`memo`)
  - [x] FormData 전송 시 Content-Type 헤더 제거 (axios 자동 처리)
  - [x] 모달 데이터 초기화 개선

---

## 📌 프로젝트 규칙 준수

### 필수 규칙
- **Import**: 절대 경로(`@/`)만 사용
- **타입**: `import type` 사용
- **컴포넌트**: PascalCase, named export
- **스타일**: Tailwind CSS만 사용, 인라인 스타일 금지
- **에러**: `utils/error.ts`의 `extractErrorMessage` 사용
- **API**: `api/services/`의 서비스 함수만 사용, 직접 `apiClient` 호출 금지
- **에러 처리**: `useErrorHandler` hook 사용

### 제약사항
- 컴포넌트 파일: 300줄 이내 권장
- 관리자 페이지: 권한 체크 필수
- 이미지 업로드: 파일 형식/크기 검증 필수
- 코드 품질: 기존 유틸/Hook/컴포넌트 재사용 필수

### 참고 파일
- 폼 패턴: `src/pages/auth/Register.tsx`
- 모달 패턴: `src/components/features/restaurant/PlaceDetailsModal.tsx`
- 에러 처리: `src/hooks/useErrorHandler.ts`
