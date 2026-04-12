# 사용자 장소 (User Place) 테스트 시나리오

## Frontend Hook 테스트

### useUserPlaceList
- [x] 초기 상태 — page=1, places 빈 배열, isLoading false, error null
- [x] 마운트 시 getUserPlaces 호출 → places/total/totalPages 반영
- [x] 로딩 중 isLoading true → 완료 후 false
- [x] API 실패 시 error 설정 + places 빈 배열 유지
- [x] handlePageChange 호출 → 새로운 페이지로 목록 재로드
- [x] handleStatusFilter 호출 → status 필터 변경 + page 1로 초기화
- [x] handleSearch 호출 → search 값 변경 + page 1로 초기화
- [x] refreshList 호출 → 현재 필터/페이지로 재조회
<!-- 제거: limit setter 없음. Hook 내부에서 const [limit] = useState(10)로 고정, 변경 불가 -->

### useUserPlaceDetail
- [x] id null — place null 유지, API 호출 안 함
- [x] 유효한 id — getUserPlace 호출 후 place 설정 + isLoading 전환
- [x] id 변경 시 자동 재로드
- [x] API 실패 시 place null + 에러 핸들링
- [x] refetch 호출 — 동일 id로 재조회

### useUserPlaceCreate
- [x] 초기 상태 — checkResult null, isCheckLoading/isCreateLoading false
- [x] checkRegistration 호출 → checkResult 설정 + isCheckLoading 전이
- [x] checkRegistration 실패 — 에러 핸들링 + checkResult null 유지
- [x] createUserPlace 호출 → 성공 응답 반환 + isCreateLoading 전이
- [x] createUserPlace 실패 — 에러 핸들링 후 재발생
- [x] resetCheckResult 호출 → checkResult null로 초기화

### useUserPlaceActions
- [x] 초기 상태 — isUpdateLoading/isDeleteLoading false
- [x] updateUserPlace 성공 → 성공 토스트 + isUpdateLoading 전이
- [x] updateUserPlace 실패 → 에러 핸들링 후 재발생, isUpdateLoading 해제
- [x] deleteUserPlace 성공 → 성공 토스트 + isDeleteLoading 전이
- [x] deleteUserPlace 실패 → 에러 핸들링 후 재발생, isDeleteLoading 해제

---

## Frontend E2E

### 사용자 장소 등록 → 목록 노출 플로우
- [ ] 로그인 후 가게 등록 페이지 진입
- [ ] 이름/주소/카테고리/메뉴 항목 입력 → 등록 가능 여부 확인 응답
- [ ] 최종 등록 버튼 클릭 → 성공 토스트 + 목록 페이지에 반영
- [ ] 목록에서 상세 진입 → 입력 값 노출 확인
