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

### useDebounce
- [x] delay 시간 전에는 이전 값 유지
- [x] delay 시간 경과 후 새 값으로 업데이트
- [x] 연속 입력 시 마지막 값만 반영 (중간 값 무시)
- [x] delay 기본값(500ms) 동작
- [x] delay 0ms → 즉시 업데이트 (setTimeout(fn, 0))
- [x] 언마운트 시 pending 타이머 정리 (에러 없음)
- [x] delay 변경 시 새 delay 기준으로 타이머 재설정
- [x] 연속 빠른 입력 (10회) → 마지막 값만 반영

### useErrorHandler
- [x] handleError — 일반 Error 객체 처리
- [x] handleError — 400 AxiosError → validation duration(4000ms)
- [x] handleError — 500 AxiosError → server error duration(5000ms)
- [x] handleError — 문자열 에러 처리
- [x] handleSuccess — 번역 키로 성공 메시지 표시
- [x] handleSuccess — 보간 파라미터 전달
- [x] handleSuccess — 커스텀 duration 전달
- [x] handleError — unknown 에러(null) 처리 시 기본 메시지 사용
