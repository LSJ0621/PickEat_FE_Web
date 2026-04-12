# 주소 (Address) 테스트 시나리오

## Frontend Hook 테스트

### useAddressSearch (useAddress.test.ts)
- [x] handleSearch — 검색어 입력 → API 호출 → 결과 반환
- [x] handleSelectAddress — 주소 선택 → selectedAddress 설정 + 검색결과 초기화
- [x] clearSearch — 모든 상태 초기화
- [x] 에러 시나리오 — 검색 API 실패 시 결과 비어있고 로딩 해제
- [x] 빠른 연속 검색 — 두 번 순차 검색 시 두 번째 결과가 최종 상태에 반영

### useAddressList (useAddressList.test.tsx)
- [x] 초기 상태 — Redux에서 주소 리스트 가져오기
- [x] handleAddressClick — 기본주소 클릭 시 무시
- [x] handleAddressClick — 비기본주소 클릭 시 확인 대화상자 표시
- [x] handleCancelSetDefault — 기본주소 변경 확인 취소
- [x] handleToggleDeleteSelection — 삭제 선택 토글
- [x] handleToggleDeleteSelection — 기본주소는 선택 불가
- [x] handleToggleDeleteSelection — 최대 3개 선택 제한
- [x] handleDeleteAddresses — 빈 배열 시 에러
- [x] handleDeleteAddresses — 기본주소 포함 시 에러
- [x] handleDeleteAddresses — 유효한 ID 배열 시 확인 대화상자 표시
- [x] handleCancelDelete — 삭제 확인 취소
- [x] toggleEditMode — 편집 모드 토글
- [x] resetEditState — 편집 상태 전체 초기화

### useAddressModal
- [x] 초기 상태 — 모든 필드 초기값
- [x] handleSearch — 주소 검색 성공
- [x] handleSearch — 빈 쿼리는 무시
- [x] handleSearch — API 실패 시 에러 처리
- [x] handleSelectAddress — 주소 선택 시 상태 업데이트
- [x] handleAddAddress — 주소 미선택 시 에러
- [x] handleAddAddress — 최대 4개 초과 시 에러
- [x] handleAddAddress — 주소 추가 성공
- [x] handleAddAddress — API 실패 시 에러 처리
- [x] resetAddressModal — 모든 상태 초기화
- [x] handleAddAddress — 첫 번째 주소(기본주소) 등록 시 Redux 업데이트

---

## Frontend E2E

### 주소 검색 → 등록 플로우
- [x] 주소 검색 → 자동완성 결과 표시 → 주소 선택 → 별칭 입력 → 저장 → 목록에 반영
