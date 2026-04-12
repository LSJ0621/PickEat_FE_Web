# 에이전트 (Agent) 테스트 시나리오

## Frontend Hook 테스트

### usePlaceDetails
- [x] placeId null — idle 상태, placeDetail null
- [x] 유효한 placeId — loading → ready 전환 + placeDetail 설정
- [x] 존재하지 않는 placeId — error 상태 + errorMessage 설정
- [x] API 서버 오류 — error 상태
- [x] placeId 변경 — 새 데이터 로딩
- [x] placeId → null 변경 — idle로 복귀

### usePlaceSelection
- [x] 초기 상태 — 모달 닫힘, 장소 없음
- [x] openModal/closeModal — 모달 상태 토글
- [x] hasPlaces — 추천 장소 있으면 true
- [x] handleSelectPlace — 커뮤니티 장소 선택 성공
- [x] handleSelectPlace — Google 검색 가게는 평점 등록 차단
- [x] handleSelectPlace — API 실패 시 에러 처리
- [x] searchPlaces + communityPlaces — 그룹에서 recommendations 평탄화

### useConfirmModal

> **검증 범위**: Hook 은 Redux 상태 `showConfirmCard`, `menuRequestAddress` 두 값만 반환한다. 모달 open/close 는 컴포넌트 레벨 dispatch 이므로 Hook 의 반환값이 아니다. 내부에서 호출하는 `useModalScrollLock`, `useEscapeKey` 는 전략 §4.1(내부 훅 의존성 원칙)에 따라 **검증 대상이 아니다** — 반환값만 테스트한다.

- [x] 초기 상태 — Redux `agent.showConfirmCard=false` → 반환 `showConfirmCard` false
- [x] Redux `agent.showConfirmCard=true` → 반환 `showConfirmCard` true
- [x] Redux `agent.showConfirmCard` false→true 전환 — 재렌더 후 반환값 true 로 반영
- [x] Redux `agent.menuRequestAddress` 값 — 반환 `menuRequestAddress` 에 그대로 노출
- [x] Redux `agent.menuRequestAddress` 변경 — 변경값 즉시 반영
- [x] `handleCancel` prop — 반환값에 포함되지 않음 (내부 `useEscapeKey` 에만 전달되며 Hook 계약상 노출 금지)
