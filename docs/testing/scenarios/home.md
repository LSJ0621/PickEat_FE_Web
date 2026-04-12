# 홈 (Home) 테스트 시나리오

## Frontend Hook 테스트

### useHomeCtaAction
- [x] 초기 상태 — showAuthPrompt false
- [x] 인증된 상태에서 handleCtaClick 호출 → navigate('/agent') 호출
- [x] 비인증 상태에서 handleCtaClick 호출 → showAuthPrompt true + navigate 호출 안 함
- [x] closeAuthPrompt 호출 → showAuthPrompt false
- [x] navigateToLogin 호출 → navigate('/login') 호출

### useHomeRecentHistory
- [x] 비인증 상태 — API 호출 없음, items 빈 배열, isVisible false
- [x] 인증 상태 — getRecommendationHistory({ limit: 3 }) 호출 → items 설정
- [x] 로딩 중 isLoading true → 완료 후 false
- [x] API 실패 — items 빈 배열 유지, 에러 토스트 없음(조용히 처리), isVisible false
- [x] items 있으면 isVisible true, 비어있으면 false
- [x] 인증 상태 전환 — 비인증→인증으로 바뀌면 재조회

---

## Frontend E2E

### 홈 CTA → 에이전트 진입 플로우
- [ ] 비인증 상태에서 CTA 클릭 → 인증 프롬프트 모달 표시
- [ ] 인증 상태에서 CTA 클릭 → `/agent` 페이지 이동
- [ ] 최근 추천 이력이 있으면 홈에 노출 확인
