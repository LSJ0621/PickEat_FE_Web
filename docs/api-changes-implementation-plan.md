# API 변경사항 프론트엔드 반영 계획

## 📋 변경사항 요약

### 1. 추천 이력 조회 API (GET /menu/recommendations/history)
- **쿼리 파라미터 추가**: `page`, `limit`, `date` (optional)
- **응답 구조 변경**: `{ history: [] }` → `{ items: [], pageInfo: {} }`
- **필드 제거**: `requestLocation` 필드 제거

### 2. 메뉴 추천 생성 API (POST /menu/recommend)
- **요청 Body 변경**: `requestAddress`, `requestLocation` 필드 제거
- **응답 구조 변경**: `requestLocation` 필드 제거

---

## 🎯 구현 계획

### Phase 1: 타입 정의 업데이트

#### 1.1 추천 이력 관련 타입 수정
**대상 파일**: `src/types/user.ts`

**작업 내용**:
1. `RecommendationHistoryItem` 인터페이스에서 `requestLocation` 필드 제거
2. `GetRecommendationHistoryResponse` 인터페이스 수정
   - `history: RecommendationHistoryItem[]` → `items: RecommendationHistoryItem[]`
   - `pageInfo` 필드 추가
3. `PageInfo` 인터페이스 생성

**예상 코드 변경**:
```typescript
// 변경 전
export interface RecommendationHistoryItem {
  id: number;
  recommendations: string[];
  prompt: string;
  recommendedAt: string;
  requestAddress: string | null;
  requestLocation: RecommendationLocation | null; // 제거
  hasPlaceRecommendations: boolean;
}

export interface GetRecommendationHistoryResponse {
  history: RecommendationHistoryItem[];
}

// 변경 후
export interface RecommendationHistoryItem {
  id: number;
  recommendations: string[];
  prompt: string;
  recommendedAt: string;
  requestAddress: string | null;
  // requestLocation 제거
  hasPlaceRecommendations: boolean;
}

export interface PageInfo {
  page: number;
  limit: number;
  totalCount: number;
  hasNext: boolean;
}

export interface GetRecommendationHistoryResponse {
  items: RecommendationHistoryItem[];
  pageInfo: PageInfo;
}
```

#### 1.2 메뉴 추천 관련 타입 수정
**대상 파일**: `src/types/menu.ts`

**작업 내용**:
1. `MenuRecommendationResponse` 인터페이스에서 `requestLocation` 필드 제거

**예상 코드 변경**:
```typescript
// 변경 전
export interface MenuRecommendationResponse {
  id: number;
  recommendations: string[];
  recommendedAt: string;
  requestAddress: string | null;
  requestLocation: { lat: number; lng: number } | null; // 제거
}

// 변경 후
export interface MenuRecommendationResponse {
  id: number;
  recommendations: string[];
  recommendedAt: string;
  requestAddress: string | null;
  // requestLocation 제거
}
```

#### 1.3 Redux State 타입 수정
**대상 파일**: `src/store/slices/agentSlice.ts`

**작업 내용**:
1. `menuRecommendationRequestLocation` 상태 제거
2. `menuRequestLocation` 상태 제거 (또는 유지하되 서버 응답에서 받지 않음)
3. 관련 액션 및 리듀서 수정

**체크리스트**:
- [x] `RecommendationHistoryItem` 타입에서 `requestLocation` 제거 (완료)
- [x] `GetRecommendationHistoryResponse` 타입 수정 (history → items, pageInfo 추가) (완료)
- [x] `PageInfo` 인터페이스 생성 (완료)
- [x] `MenuRecommendationResponse` 타입에서 `requestLocation` 제거 (완료)
- [x] `PlaceHistoryMeta` 타입에서 `requestLocation` 제거 (완료)
- [x] 타입 에러 해결을 위한 최소 수정 (완료)
  - [x] `user.ts`: `history` → `items` 변경
  - [x] `RecommendationHistory.tsx`: `result.history` → `result.items` 변경
  - [x] `HistoryItem.tsx`: `requestLocation` 사용 제거
  - [x] `MenuRecommendation.tsx`: `requestLocation` 사용 제거
  - [x] `useHistoryAiRecommendations.ts`: `requestLocation` 사용 제거
- [ ] Redux state에서 `requestLocation` 관련 필드 제거 (Phase 4에서 처리)
- [x] 빌드 성공 확인 (완료)

---

### Phase 2: API 서비스 함수 수정

#### 2.1 추천 이력 조회 API 수정
**대상 파일**: `src/api/services/user.ts`

**작업 내용**:
1. `getRecommendationHistory` 함수에 페이지네이션 파라미터 추가
2. 응답 구조 변경에 맞게 데이터 처리 로직 수정

**예상 코드 변경**:
```typescript
// 변경 전
getRecommendationHistory: async (date?: string): Promise<GetRecommendationHistoryResponse> => {
  const response = await apiClient.get<GetRecommendationHistoryResponse>(
    ENDPOINTS.RECOMMENDATION_HISTORY,
    { params: date ? { date } : undefined }
  );
  return response.data;
}

// 변경 후
getRecommendationHistory: async (
  options?: {
    date?: string;
    page?: number;
    limit?: number;
  }
): Promise<GetRecommendationHistoryResponse> => {
  const params: Record<string, string | number> = {};
  
  if (options?.date) {
    params.date = options.date;
  }
  if (options?.page !== undefined) {
    params.page = options.page;
  }
  if (options?.limit !== undefined) {
    params.limit = options.limit;
  }
  
  const response = await apiClient.get<GetRecommendationHistoryResponse>(
    ENDPOINTS.RECOMMENDATION_HISTORY,
    { params: Object.keys(params).length > 0 ? params : undefined }
  );
  
  // 응답 구조 변경: history → items
  return {
    items: response.data.items,
    pageInfo: response.data.pageInfo,
  };
}
```

#### 2.2 메뉴 추천 생성 API 수정
**대상 파일**: `src/api/services/menu.ts`

**작업 내용**:
1. `recommend` 함수는 이미 `prompt`만 전송하므로 변경 불필요 (확인 필요)
2. 응답에서 `requestLocation` 필드 제거 처리

**예상 코드 변경**:
```typescript
// 현재 코드 확인 필요
recommend: async (prompt: string): Promise<MenuRecommendationResponse> => {
  const response = await apiClient.post<MenuRecommendationResponse>(
    ENDPOINTS.MENU.RECOMMEND,
    { prompt } // 이미 requestAddress, requestLocation 없음
  );
  // 응답에서 requestLocation이 없으므로 타입만 수정하면 됨
  return response.data;
}
```

**체크리스트**:
- [x] `getRecommendationHistory` 함수에 페이지네이션 파라미터 추가 (완료)
  - [x] `options` 파라미터 추가 (date, page, limit)
  - [x] 쿼리 파라미터 구성 로직 추가
- [x] 응답 구조 변경 처리 (history → items) (완료)
  - [x] `response.data.items` 사용
  - [x] `response.data.pageInfo` 반환
- [x] `recommend` 함수 확인 및 필요시 수정 (완료)
  - [x] 이미 `prompt`만 전송하므로 변경 불필요 확인됨
  - [x] 응답 타입에서 `requestLocation` 제거됨 (Phase 1에서 완료)
- [x] 빌드 성공 확인 (완료)

---

### Phase 3: 페이지네이션 UI 구현

#### 3.1 추천 이력 페이지 수정
**대상 파일**: `src/pages/history/RecommendationHistory.tsx`

**작업 내용**:
1. 페이지네이션 상태 추가 (`page`, `hasNext`)
2. `loadHistory` 함수 수정하여 페이지네이션 파라미터 전달
3. "더 보기" 또는 페이지네이션 UI 추가
4. 무한 스크롤 또는 페이지네이션 버튼 구현

**예상 코드 변경**:
```typescript
// 상태 추가
const [page, setPage] = useState(1);
const [hasNext, setHasNext] = useState(false);
const [totalCount, setTotalCount] = useState(0);

// loadHistory 함수 수정
const loadHistory = useCallback(async (pageNum: number = 1, append: boolean = false) => {
  setLoading(true);
  try {
    const result = await userService.getRecommendationHistory({
      date: selectedDate || undefined,
      page: pageNum,
      limit: 10,
    });
    
    if (append) {
      setHistory((prev) => [...prev, ...result.items]);
    } else {
      setHistory(result.items);
    }
    
    setPage(result.pageInfo.page);
    setHasNext(result.pageInfo.hasNext);
    setTotalCount(result.pageInfo.totalCount);
  } catch (error: unknown) {
    handleError(error, 'RecommendationHistory');
  } finally {
    setLoading(false);
  }
}, [selectedDate, handleError]);

// 더 보기 버튼 핸들러
const handleLoadMore = useCallback(() => {
  if (hasNext && !loading) {
    loadHistory(page + 1, true);
  }
}, [hasNext, loading, page, loadHistory]);
```

**UI 추가**:
```typescript
{/* 더 보기 버튼 */}
{hasNext && (
  <div className="mt-6 text-center">
    <Button
      onClick={handleLoadMore}
      disabled={loading}
      variant="ghost"
      size="lg"
    >
      {loading ? '로딩 중...' : '더 보기'}
    </Button>
  </div>
)}
```

**체크리스트**:
- [x] 페이지네이션 상태 추가 (page, hasNext, totalCount, loadingMore) (완료)
- [x] `loadHistory` 함수에 페이지네이션 파라미터 추가 (완료)
  - [x] `targetPage`, `append` 파라미터 추가
  - [x] 누적 로딩 지원 (append 모드)
  - [x] `pageInfo` 상태 업데이트
- [x] 필터 변경 시 페이지 리셋 로직 추가 (완료)
- [x] "더 보기" 버튼 UI 추가 (완료)
  - [x] `hasNext`가 true일 때만 표시
  - [x] 로딩 상태 표시 (`loadingMore`)
  - [x] 전체 개수 표시 (선택적)
- [x] 무한 스크롤 구현 (완료)
  - [x] Intersection Observer API 사용
  - [x] 하단 200px 전에 미리 로드 (`rootMargin: '200px'`)
  - [x] 로딩 중 표시
  - [x] 모든 데이터 로드 완료 시 메시지 표시
- [x] 로딩 상태 처리 (완료)
  - [x] 초기 로딩 (`loading`)
  - [x] 더 보기 로딩 (`loadingMore`)
- [x] 빌드 및 기능 테스트 (완료)

---

### Phase 4: requestLocation 필드 제거 (주소 정보는 유지)

#### ⚠️ 중요: 주소 정보는 유지됩니다
- **유지**: `requestAddress` (주소 문자열, 예: "서울시 강남구...")
- **제거**: `requestLocation` (위도/경도 좌표 객체, 예: `{ lat: 37.5, lng: 127.0 }`)

**이유**: 서버에서 더 이상 `requestLocation` 좌표 정보를 제공하지 않지만, `requestAddress` 주소 문자열은 계속 제공됩니다.

#### 4.1 컴포넌트에서 requestLocation 사용 제거
**대상 파일**:
- `src/components/features/menu/MenuRecommendation.tsx`
- `src/components/features/history/HistoryItem.tsx`
- `src/hooks/history/useHistoryAiRecommendations.ts`
- `src/pages/main/Agent.tsx`

**작업 내용**:
1. `requestLocation` 필드 사용하는 모든 코드 제거 또는 수정
2. `requestAddress`는 **그대로 유지** (주소 문자열은 계속 사용)
3. 위치 좌표가 필요한 경우 `useUserLocation` Hook의 `latitude`, `longitude` 사용

**주요 사용 위치**:
- `Agent.tsx`: `hasAiQueryContext` 체크, `handleMenuClick` 파라미터, AI 추천 쿼리 생성
- `MenuRecommendation.tsx`: Redux state에서 가져오기, `onMenuSelect` 콜백 전달
- `HistoryItem.tsx`: `hasAiQueryContext` 체크
- `useHistoryAiRecommendations.ts`: AI 추천 쿼리 생성 시 좌표 문자열 변환

**주요 변경 위치**:

**MenuRecommendation.tsx**:
```typescript
// 변경 전
dispatch(
  setMenuRecommendations({
    recommendations: result.recommendations,
    historyId: result.id,
    prompt,
    requestAddress: result.requestAddress ?? null,
    requestLocation: result.requestLocation ?? null, // 제거
  })
);

// 변경 후
dispatch(
  setMenuRecommendations({
    recommendations: result.recommendations,
    historyId: result.id,
    prompt,
    requestAddress: result.requestAddress ?? null,
    // requestLocation 제거
  })
);
```

**useHistoryAiRecommendations.ts**:
```typescript
// 변경 전
const locationFallback = historyItem.requestLocation
  ? `${historyItem.requestLocation.lat},${historyItem.requestLocation.lng}`
  : latitude !== null && longitude !== null
    ? `${latitude},${longitude}`
    : null;

// 변경 후
// requestLocation이 없으므로 항상 현재 위치 사용
const locationFallback = latitude !== null && longitude !== null
  ? `${latitude},${longitude}`
  : null;
```

**HistoryItem.tsx**:
```typescript
// 변경 전
const hasAiQueryContext = Boolean(
  item.requestAddress?.trim() ||
    item.requestLocation ||  // 제거
    address?.trim() ||
    (latitude !== null && longitude !== null)
);

// 변경 후
const hasAiQueryContext = Boolean(
  item.requestAddress?.trim() ||
    address?.trim() ||
    (latitude !== null && longitude !== null)
);
```

**Agent.tsx**:
```typescript
// 변경 전
const hasAiQueryContext = Boolean(
  menuRequestAddress?.trim() ||
    menuRequestLocation ||  // 제거
    address?.trim() ||
    (latitude !== null && longitude !== null)
);

const handleMenuClick = (
  menu: string,
  historyId: number,
  meta: { requestAddress: string | null; requestLocation: RecommendationLocation | null } = {
    requestAddress: null,
    requestLocation: null,  // 제거
  }
) => {
  dispatch(
    setSelectedMenu({
      menu,
      historyId,
      requestAddress: meta.requestAddress ?? null,
      requestLocation: meta.requestLocation ?? null,  // 제거
    })
  );
};

const locationFallback = menuRequestLocation
  ? `${menuRequestLocation.lat},${menuRequestLocation.lng}`  // 제거
  : latitude !== null && longitude !== null
    ? `${latitude},${longitude}`
    : null;

// 변경 후
const hasAiQueryContext = Boolean(
  menuRequestAddress?.trim() ||
    address?.trim() ||
    (latitude !== null && longitude !== null)
);

const handleMenuClick = (
  menu: string,
  historyId: number,
  meta: { requestAddress: string | null } = {
    requestAddress: null,
  }
) => {
  dispatch(
    setSelectedMenu({
      menu,
      historyId,
      requestAddress: meta.requestAddress ?? null,
      // requestLocation 제거
    })
  );
};

const locationFallback = latitude !== null && longitude !== null
  ? `${latitude},${longitude}`
  : null;
```

**MenuRecommendation.tsx**:
```typescript
// 변경 전
const requestLocation = useAppSelector((state) => state.agent.menuRecommendationRequestLocation);

dispatch(
  setMenuRecommendations({
    recommendations: result.recommendations,
    historyId: result.id,
    prompt,
    requestAddress: result.requestAddress ?? null,
    requestLocation: result.requestLocation ?? null,  // 제거
  })
);

onMenuSelect?.(menu, menuHistoryId, {
  requestAddress,
  requestLocation,  // 제거
})

// 변경 후
// requestLocation 관련 코드 모두 제거
dispatch(
  setMenuRecommendations({
    recommendations: result.recommendations,
    historyId: result.id,
    prompt,
    requestAddress: result.requestAddress ?? null,
    // requestLocation 제거
  })
);

onMenuSelect?.(menu, menuHistoryId, {
  requestAddress,
  // requestLocation 제거
})
```

#### 4.2 Redux State 수정
**대상 파일**: `src/store/slices/agentSlice.ts`

**작업 내용**:
1. `menuRecommendationRequestLocation` 상태 제거 (좌표 객체)
2. `menuRequestLocation` 상태 제거 (좌표 객체)
3. **`menuRecommendationRequestAddress`는 유지** (주소 문자열)
4. **`menuRequestAddress`는 유지** (주소 문자열)
5. 관련 액션 및 리듀서에서 `requestLocation` 파라미터만 제거

**Redux State 변경 예시**:
```typescript
// 변경 전
interface AgentState {
  menuRecommendationRequestAddress: string | null;
  menuRecommendationRequestLocation: RecommendationLocation | null; // 제거
  menuRequestAddress: string | null;
  menuRequestLocation: RecommendationLocation | null; // 제거
}

// 변경 후
interface AgentState {
  menuRecommendationRequestAddress: string | null; // 유지
  // menuRecommendationRequestLocation 제거
  menuRequestAddress: string | null; // 유지
  // menuRequestLocation 제거
}
```

**체크리스트**:
- [x] `MenuRecommendation.tsx`에서 `requestLocation` 제거 (완료)
  - [x] Redux에서 `menuRecommendationRequestLocation` 가져오기 제거
  - [x] `setMenuRecommendations` 액션에서 `requestLocation` 제거
  - [x] `onMenuSelect` 콜백에서 `requestLocation` 제거
  - [x] `requestAddress`는 유지
- [x] `HistoryItem.tsx`에서 `requestLocation` 사용 제거 (완료)
  - [x] `hasAiQueryContext` 체크에서 `item.requestLocation` 제거 (이미 제거되어 있음)
  - [x] `requestAddress`는 유지
- [x] `useHistoryAiRecommendations.ts`에서 `requestLocation` 사용 제거 (완료)
  - [x] `historyItem.requestLocation` 사용 제거 (이미 제거되어 있음)
  - [x] 좌표가 필요한 경우 `useUserLocation` Hook의 `latitude`, `longitude` 사용
  - [x] `requestAddress`는 그대로 사용
- [x] `Agent.tsx`에서 `requestLocation` 관련 코드 제거 (완료)
  - [x] `RecommendationLocation` import 제거
  - [x] Redux에서 `menuRequestLocation` 가져오기 제거
  - [x] `hasAiQueryContext` 체크에서 `menuRequestLocation` 제거
  - [x] `handleMenuClick` 파라미터에서 `requestLocation` 제거
  - [x] `setSelectedMenu` 액션에서 `requestLocation` 제거
  - [x] AI 추천 쿼리 생성 시 `menuRequestLocation` 대신 `useUserLocation` 사용
  - [x] `requestAddress`는 유지
- [x] Redux state에서 `requestLocation` 필드만 제거 (완료)
  - [x] `RecommendationLocation` import 제거
  - [x] `menuRecommendationRequestLocation` 상태 제거
  - [x] `menuRequestLocation` 상태 제거
  - [x] `setMenuRecommendations` 액션에서 `requestLocation` 파라미터 제거
  - [x] `setSelectedMenu` 액션에서 `requestLocation` 파라미터 제거
  - [x] `clearMenuRecommendations`에서 `requestLocation` 초기화 제거
  - [x] `clearSelectedMenu`에서 `requestLocation` 초기화 제거
  - [x] `requestAddress` 관련 필드는 모두 유지
- [x] 모든 컴포넌트에서 타입 에러 확인 및 수정 (완료)

---

## 📝 전체 체크리스트

### Phase 1: 타입 정의 업데이트
- [x] `RecommendationHistoryItem` 타입에서 `requestLocation` 제거 (완료)
- [x] `GetRecommendationHistoryResponse` 타입 수정 (history → items, pageInfo 추가) (완료)
- [x] `PageInfo` 인터페이스 생성 (완료)
- [x] `MenuRecommendationResponse` 타입에서 `requestLocation` 제거 (완료)
- [x] `PlaceHistoryMeta` 타입에서 `requestLocation` 제거 (완료)
- [x] 빌드 성공 확인 (완료)

### Phase 2: API 서비스 함수 수정
- [x] `getRecommendationHistory` 함수에 페이지네이션 파라미터 추가 (완료)
- [x] 응답 구조 변경 처리 (history → items) (완료)
- [x] `recommend` 함수 확인 및 필요시 수정 (완료)
- [x] 빌드 성공 확인 (완료)

### Phase 3: 페이지네이션 UI 구현
- [x] 페이지네이션 상태 추가 (page, hasNext, totalCount, loadingMore) (완료)
- [x] `loadHistory` 함수에 페이지네이션 파라미터 추가 (완료)
- [x] 필터 변경 시 페이지 리셋 로직 추가 (완료)
- [x] 무한 스크롤 구현 (완료)
- [x] 로딩 상태 처리 (완료)
- [x] 빌드 및 기능 테스트 (완료)

### Phase 4: requestLocation 필드 제거
- [x] `MenuRecommendation.tsx`에서 `requestLocation` 제거 (완료)
  - [x] `onMenuSelect` 인터페이스에서 `requestLocation` 타입 제거
  - [x] Redux에서 `menuRecommendationRequestLocation` selector 제거
  - [x] `setMenuRecommendations` 액션 호출에서 `requestLocation` 제거
  - [x] `onMenuSelect` 콜백 호출에서 `requestLocation` 전달 제거
- [x] `HistoryItem.tsx`에서 `requestLocation` 사용 제거 (완료)
  - [x] `hasAiQueryContext` 체크에서 `item.requestLocation` 제거 (이미 제거되어 있음)
- [x] `useHistoryAiRecommendations.ts`에서 `requestLocation` 사용 제거 (완료)
  - [x] `locationFallback` 생성 시 `historyItem.requestLocation` 사용 제거 (이미 제거되어 있음)
- [x] `Agent.tsx`에서 `requestLocation` 관련 코드 제거 (완료)
  - [x] `RecommendationLocation` import 제거
  - [x] Redux에서 `menuRequestLocation` selector 제거
  - [x] `hasAiQueryContext` 체크에서 `menuRequestLocation` 제거
  - [x] `handleMenuClick` 파라미터에서 `requestLocation` 제거
  - [x] `setSelectedMenu` 액션 호출에서 `requestLocation` 제거
  - [x] AI 추천 쿼리 생성 시 `menuRequestLocation` 대신 `useUserLocation` 사용
- [x] Redux state에서 `requestLocation` 필드 제거 (완료)
  - [x] `RecommendationLocation` import 제거
  - [x] `menuRecommendationRequestLocation` 상태 제거
  - [x] `menuRequestLocation` 상태 제거
  - [x] `setMenuRecommendations` 액션에서 `requestLocation` 파라미터 제거
  - [x] `setSelectedMenu` 액션에서 `requestLocation` 파라미터 제거
  - [x] `clearMenuRecommendations`에서 `requestLocation` 초기화 제거
  - [x] `clearSelectedMenu`에서 `requestLocation` 초기화 제거
- [x] 모든 컴포넌트에서 타입 에러 확인 및 수정 (완료)

---

## ⚠️ 주의사항

1. **하위 호환성**: 기존 코드에서 `requestLocation`을 사용하는 부분이 있을 수 있으므로 모든 파일을 확인해야 함
2. **페이지네이션**: 첫 페이지 로드 시 `page=1`, `limit=10` 기본값 사용
3. **에러 처리**: 페이지네이션 실패 시 기존 데이터 유지
4. **로딩 상태**: "더 보기" 버튼 클릭 시 로딩 상태 표시
5. **타입 안정성**: 모든 타입 변경 후 TypeScript 컴파일 에러 확인 필수

---

## 📅 예상 일정

- **Phase 1**: 타입 정의 업데이트 (30분)
- **Phase 2**: API 서비스 함수 수정 (1시간)
- **Phase 3**: 페이지네이션 UI 구현 (2-3시간)
- **Phase 4**: requestLocation 필드 제거 (1-2시간)
- **최종 테스트**: (1시간)

**총 예상 시간**: 5-7시간
