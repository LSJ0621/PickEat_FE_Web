# 사용자 (User) 테스트 시나리오

## Frontend Hook 테스트

### usePreferences
- [x] 초기 상태 — options 없으면 빈 배열
- [x] 초기 상태 — options로 초기값 제공
- [x] 초기 상태 — Redux에서 취향 정보 가져오기
- [x] handleAddLike — 좋아하는 것 추가
- [x] handleAddLike — 중복 항목은 추가되지 않음
- [x] handleAddLike — 빈 문자열은 추가되지 않음
- [x] handleRemoveLike — 좋아하는 것 제거
- [x] handleAddDislike / handleRemoveDislike — 싫어하는 것 추가/제거
- [x] handleSavePreferences — 성공 시 true 반환 + Redux 업데이트
- [x] handleSavePreferences — API 실패 시 false 반환 + 에러 처리
- [x] loadPreferences — API에서 취향 정보 로드
- [x] resetPreferencesModal — newLike/newDislike 초기화

### useOnboarding
- [x] 초기 상태 — isOpen false, currentStep 0
- [x] checkOnboarding — localStorage에 완료 키 없으면 온보딩 열기
- [x] checkOnboarding — localStorage에 완료 키 있으면 온보딩 열지 않음
- [x] nextStep — 다음 스텝으로 이동 (최대값 초과 방지)
- [x] prevStep — 이전 스텝으로 이동 (0 미만 방지)
- [x] complete — localStorage에 완료 저장 + 모달 닫기 + Redux 무효화
- [x] skip — localStorage에 완료 저장 + 모달 닫기 (Redux 무효화 없음)
- [x] openOnboarding CustomEvent — 이벤트 발생 시 온보딩 열기

---

## Frontend E2E

### 마이페이지 취향 수정 → 로그아웃 플로우

> **Mock 전략**: Happy Path는 BE E2E_MOCK 모드(기본) 사용. Error Case의 500 응답은 Playwright `page.route('**/user/preferences', ...)`로 개별 override.

**Happy Path: 로그인 → 취향 편집 → 저장 → 로그아웃**
- [x] 로그인 페이지(`/login`) 진입
- [x] 이메일(`test@example.com`) / 비밀번호(`password123`) 입력 후 로그인 버튼 클릭
- [x] 메인 페이지(`/`) 도달 + 헤더 사용자 메뉴에 이름 노출 확인
- [x] 하단 탭바(`AppFooter`)에서 "마이페이지" 탭 버튼 클릭 → URL이 `/mypage`로 변경 (대안: `page.goto('/mypage')`)
- [x] 프로필 Hero 카드에 이름/이메일 렌더링 확인
- [x] 섹션 네비게이션에서 "취향" 항목 클릭 → URL이 `/mypage/preferences`로 변경
- [x] "취향 수정" 버튼 클릭 → 취향 편집 모달(`role="dialog"`) 표시
- [x] 좋아요 입력창에 "떡볶이" 입력 → "추가" 버튼 클릭 → `data-testid="like-tag"` 목록에 "떡볶이" 표시
- [x] 싫어요 입력창에 "가지" 입력 → "추가" 버튼 클릭 → `data-testid="dislike-tag"` 목록에 "가지" 표시
- [x] "취향 정보 저장" 버튼 클릭 → 모달 닫힘 + PreferencesSection 에 "떡볶이", "가지" 반영 확인
- [x] 페이지 새로고침 후 저장된 취향 유지 확인
- [x] 뒤로가기 버튼 클릭 → URL이 `/mypage`로 복귀
- [x] "로그아웃" 버튼 클릭 → 로그인 페이지(`/login`)로 리다이렉트 + 헤더 사용자 메뉴 미노출 확인

**Error Case: 취향 저장 API 실패**
- [x] `page.route('**/user/preferences', route => route.fulfill({ status: 500 }))`로 500 응답 목킹
- [x] 취향 편집 모달에서 새 항목 추가 후 "취향 정보 저장" 버튼 클릭
- [x] 에러 토스트(`role="status"` 또는 ToastProvider 노드) 표시 확인
- [x] 모달이 닫히지 않고 입력한 좋아요/싫어요 배지 목록 상태가 유지됨을 확인
