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
