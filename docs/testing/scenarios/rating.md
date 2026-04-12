# 평점 (Rating) 테스트 시나리오

## Frontend Hook 테스트

### useRatingPrompt
- [x] RATING_NEVER_SHOW 플래그 있으면 API 호출 안 함
- [x] RATING_NEVER_SHOW 없으면 API 호출함
- [x] pending rating 있으면 pendingRating 설정 + 모달 오픈
- [x] pending rating null이면 모달 안 열림
- [x] API 실패 시 조용히 처리 — 모달 안 열림
- [x] dismissPermanently 호출 → localStorage에 NEVER_SHOW 플래그 저장
- [x] dismissPermanently 호출 → 모달 닫힘 + pendingRating 초기화
- [x] dismissPermanently 후 checkPendingRating 재호출 → API 호출 안 함
- [x] skipPlace 호출 → API 호출 + 모달 닫힘
- [x] skipPlace API 실패 시 조용히 처리 — 모달 닫힘 + pendingRating 초기화
- [x] 초기 상태 — pendingRating null, isModalOpen false, isSubmitting false

### useRatingHistory

> **검증 범위**: Hook 반환 함수는 `fetchHistory`, `handleSubmitRating`, `handleSkipRating`, `handleDateChange`, `handleClearDate` 이다. 내부에서 사용하는 `useToast`, `useDateFilter` 는 전략 §4.1(내부 훅 의존성 원칙)에 따라 검증 대상이 아니다 — `ratingService` mock 과 반환 상태만 검증한다.

- [ ] 초기 상태 — items 빈 배열, page 1, totalPages 0, isLoading false
- [ ] 마운트 시 `ratingService.getRatingHistory` 호출 → items/total/page/totalPages 상태 반영
- [ ] `handleDateChange` 호출 — selectedDate 변경 + page 1 로 재조회 트리거
- [ ] `fetchHistory(targetPage)` 호출 — 지정 페이지로 조회 + page 상태 업데이트
- [x] `handleSubmitRating(placeRatingId, rating)` 성공 — submitRating 호출 후 fetchHistory 재실행, items 갱신
- [x] `handleSubmitRating` 실패 — 기존 items 유지, isLoading 복구
- [x] `handleSkipRating(placeRatingId)` 성공 — skipRating 호출 후 fetchHistory 재실행, items 갱신
- [x] `handleSkipRating` 실패 — 기존 items 유지, isLoading 복구
- [ ] API 호출 중 isLoading true → 완료 후 false (finally 분기)

---

## Frontend E2E

### 평점 제출 플로우 (프롬프트 모달 → 별점 제출)

> **Mock 전략**:
> - 사전 조건: `localStorage.removeItem('ratingPromptNeverShow')` 로 초기화
> - `GET /ratings/pending`은 Playwright `page.route`로 대기 중 항목 1건 반환 fixture 주입
> - Happy Path의 submit 성공은 BE E2E_MOCK 모드 사용 가능, Error Case 500은 `page.route`로 override
> - Pending 카드 셀렉터 전략: `data-testid` 미정 → `getByText(placeName)` 기반 locator 사용 (향후 컴포넌트에 testid 추가 권장)

**Happy Path: 평점 프롬프트 → 이력 페이지에서 별점 제출**
- [x] 로그인 상태로 메인 페이지(`/`) 진입 전, localStorage `ratingPromptNeverShow` 키 제거
- [x] `page.route('**/ratings/pending', ...)` 로 대기 중 평점 1건(`placeName: "김밥천국"`) 반환 목킹
- [x] 메인 페이지(`/`) 로드 → RatingPromptModal 표시 확인 (`role="dialog"` + 가게명 "김밥천국" 노출)
- [x] "평점 남기기" 버튼 클릭 → URL이 `/ratings/history`로 변경
- [x] `page.getByText('김밥천국')` 로 Pending 카드 영역 식별 확인
- [x] Pending 카드 내 별점 3번째 별(`aria-label="3점"`) 클릭 → StarRatingInput 에 별 3개 채워짐 확인
- [x] "제출" 버튼 클릭 (POST `/ratings/submit` 성공 응답)
- [x] 제출된 카드가 Pending 목록에서 사라지고, 완료 목록에 별 3개 ReadOnlyStars 로 렌더링 확인
- [x] 성공 토스트 메시지(`role="status"`) 표시 확인

**Alternate Path: "안 갔어요"로 평점 skip**
- [x] RatingPromptModal 에서 "안 갔어요" 버튼 클릭
- [x] POST `/ratings/skip` 호출 확인 (Playwright `waitForRequest`)
- [x] 모달 닫힘 + 메인 페이지(`/`) URL 유지 확인

**Error Case: 제출 API 실패**
- [x] `page.route('**/ratings/submit', route => route.fulfill({ status: 500 }))` 로 500 응답 목킹
- [x] 이력 페이지에서 Pending 카드 별점 선택 후 "제출" 클릭
- [x] 에러 토스트 표시 확인
- [x] 해당 Pending 카드가 목록에 그대로 유지됨 확인
