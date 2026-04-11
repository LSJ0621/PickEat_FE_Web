# 공통 인프라 (Common) 테스트 시나리오

## Frontend Unit 테스트

### Utils
- [x] cn — className 병합 (충돌 해결, 조건부 클래스)
- [x] error — extractErrorMessage 우선순위 (errorCode > 한국어 message > HTTP 상태) + translateErrorCode
- [x] format — 날짜/시간/숫자/가격/전화번호/상대시간/다국어 포맷팅 (경계값 포함)
- [x] jwt — decodeJwt + getUserRoleFromToken (유효/무효/만료 토큰)
- [x] validation — isValidEmail/isValidPassword/isPasswordMatch/isValidPhone/isEmpty

### Hooks (공통)
- [x] useInitialDataLoad — StrictMode 이중 실행 방지
- [x] useInitialDataLoad — 경로 변경 시 재로드 (다른 경로 → 재호출, 같은 경로 → 스킵)
- [x] useInitialDataLoad — enabled false → 실행 안 함, false → true 변경 시 실행
- [x] useRatingPrompt — localStorage RATING_NEVER_SHOW 플래그 확인
- [x] useRatingPrompt — pending rating 존재 시 모달 오픈 (null이면 안 열림, API 실패 시 조용히 처리)
- [x] useRatingPrompt — dismissPermanently → 영구 숨김 (localStorage + 모달 닫힘)
- [x] useRatingPrompt — skipPlace → API 호출 + 모달 닫힘 (실패 시 조용히 처리)
- [x] useRatingPrompt — 초기 상태 (pendingRating null, isModalOpen false, isSubmitting false)
