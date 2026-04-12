# 히스토리 (History) 테스트 시나리오

## Frontend Hook 테스트

### useDateFilter
- [x] 초기 상태 — selectedDate null, isToday false
- [x] handleSelectToday — 오늘 날짜 선택 시 isToday true
- [x] handleDateChange — 특정 날짜 선택
- [x] handleClearDate — 날짜 초기화
- [x] onDateChange 콜백 — 날짜 변경 전 호출
- [x] startDate/endDate — selectedDate와 동기화
- [x] handleQuickSelect("today") — handleSelectToday 위임
- [x] handleQuickSelect("all") — handleClearDate 위임
- [x] handleQuickSelect("week"/"month") — clear로 처리

### useHistoryAiRecommendations
- [x] 초기 상태 — aiRecommendations 빈 배열, isAiLoading false, aiLoadingMenu null
- [x] 비로그인 상태에서 요청 → 에러 처리 + API 호출 안 함
- [x] 위치/주소 누락 → 검증 에러 처리, recommendPlacesV2 호출 안 함
- [x] recommendPlacesV2 성공 → aiRecommendations 정규화 후 반영 + isAiLoading 전이
- [x] 400 에러 → getPlaceRecommendationsByHistoryId 폴백으로 저장된 추천 로드
- [x] 400 이외 에러 → 에러 핸들링 + aiRecommendations 유지
- [x] 요청 중 aiLoadingMenu에 현재 메뉴명 노출 → 완료 후 null
- [x] searchEntryPointHtml — 응답의 HTML 저장 후 반환

### useHistoryMenuActions
- [x] 초기 상태 — selectedMenu null, showConfirmCard false
- [x] handleMenuClick — 메뉴 선택 + showConfirmCard true
- [x] handleMenuClick — 다른 메뉴 재선택 시 selectedMenu 업데이트
- [x] handleCancel — showConfirmCard false로 전환 (selectedMenu는 유지 — 현재 동작)
<!-- 주의: 원 시나리오는 selectedMenu도 null로 초기화한다고 가정했으나 실제 Hook은 showConfirmCard만 false로 내림. 잠재 FE 버그 후보로 보고. -->

### useHistoryAiHistory
- [x] 초기 상태 — showAiHistory false, aiHistoryRecommendations 빈 배열
- [x] 비로그인 상태 — toggle 호출 시 조용히 무시
- [x] hasPlaceRecommendations false — 조회 건너뜀
- [x] toggle 호출 → 열림 + getPlaceRecommendationsByHistoryId 호출 + isAiHistoryLoading 전이
- [x] API 성공 — menuName 기준 groupedAiHistory 구성
- [x] API 실패 → 에러 처리 + 목록 빈 상태 유지
- [x] 이미 열린 상태에서 toggle → 닫힘 + 목록 초기화 안 함
