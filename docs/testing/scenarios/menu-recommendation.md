# 메뉴 추천 (Menu Recommendation) 테스트 시나리오

## Frontend Hook 테스트

### useAgentActions
- [x] handleMenuClick — 메뉴 선택 시 Redux dispatch 확인
- [x] handleAiRecommendation — search + community 두 SSE 스트림 병렬 시작
- [x] handleAiRecommendation — 하나의 스트림 실패 시 다른 스트림은 계속 진행
- [x] handleAiRecommendation — 앱 백그라운드 전환 시 요청 중단
- [x] handleAiRecommendation — placeId 정규화 (places/ 프리픽스 제거)
- [x] handleAiRecommendation — 이미 추천 결과가 있으면 캐시된 데이터 반환
- [x] handleCancel — 추천 확인카드 닫기

### useStreamingRequest
- [x] SSE 이벤트 수신 → 800ms 최소 표시 시간 적용
- [x] status/retrying/result/error 이벤트 타입별 처리
- [x] 컴포넌트 언마운트 시 타이머 클린업

---

## Frontend E2E

### 메뉴 추천 → 맛집 확인 플로우
- [x] 프롬프트 입력 → AI 응답 수신 → 추천 메뉴 표시 → 메뉴 선택 → 맛집 추천 → 지도 확인
