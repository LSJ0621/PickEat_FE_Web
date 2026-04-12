# 버그 리포트 (Bug Report) 테스트 시나리오

## Frontend E2E

### 버그 제보 작성 → 제출 플로우

> **Mock 전략**: Happy Path는 BE E2E_MOCK 모드(기본) 사용. Error Case의 500 응답은 Playwright `page.route('**/bug-reports', ...)`로 개별 override. 이미지 첨부는 Playwright `locator.setInputFiles()`로 로컬 fixture 파일 주입.

**Happy Path: 버그 제보 작성 및 제출**
- [x] 로그인 상태로 마이페이지(`/mypage`) 진입
- [x] 서포트 섹션의 "버그 제보" 항목 클릭 → URL이 `/bug-report`로 변경
- [x] 버그 제보 페이지 제목(`bugReport.pageTitle`) 렌더링 확인
- [x] 카테고리 라디오에서 "BUG" 선택 → 체크 상태 확인
- [x] 제목 입력란에 "지도 마커 클릭 시 상세 미표시" 입력
- [x] 제목 글자수 카운터가 `XX/30` 형식으로 업데이트됨 확인
- [x] 상세 내용 textarea에 "마커를 탭해도 팝업이 뜨지 않습니다." 입력
- [x] 상세 글자수 카운터가 `XX/500` 형식으로 업데이트됨 확인
- [x] "제출하기" 버튼 클릭 → POST `/bug-reports` 성공 응답 목킹
- [x] 성공 토스트(`bugReport.success` / `role="status"`) 표시 확인
- [x] 메인 페이지(`/`)로 리다이렉트 확인

**Error Case 1: 필수 필드 유효성 검사**
- [x] `/bug-report` 진입 상태에서 제목/상세를 비운 채 "제출하기" 버튼 클릭
- [x] 제목 필드 하단에 에러 메시지(`errors.title`) 표시
- [x] 상세 필드 하단에 에러 메시지(`errors.description`) 표시
- [x] 페이지 이동 없이 `/bug-report` 유지 확인

**Error Case 2: 이미지 업로드 포함 + 서버 오류**
- [x] 제목/상세 정상 입력 후 ImageUploader 의 파일 input 에 `setInputFiles(['tests/fixtures/sample.png'])` 로 이미지 1개 첨부
- [x] 업로드된 이미지 미리보기 표시 확인
- [x] `page.route('**/bug-reports', route => route.fulfill({ status: 500 }))` 로 500 응답 목킹
- [x] "제출하기" 버튼 클릭
- [x] 에러 토스트 표시 확인
- [x] 페이지가 `/bug-report`에 그대로 유지되고 카테고리(BUG)/제목/상세/첨부 이미지 상태가 모두 보존됨 확인
