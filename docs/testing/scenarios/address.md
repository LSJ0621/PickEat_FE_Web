# 주소 (Address) 테스트 시나리오

## Frontend Hook 테스트

### useAddressSearch
- [x] handleSearch — 검색어 입력 → API 호출 → 결과 반환
- [x] handleSelectAddress — 주소 선택 → selectedAddress 설정 + 검색결과 초기화
- [x] clearSearch — 모든 상태 초기화

### useAddressList
- [x] loadAddresses — 주소 목록 로드
- [x] handleSetDefaultAddress — 기본 주소 변경 → Redux auth 동시 업데이트
- [x] handleDeleteAddresses — 삭제 확인 후 삭제 → 목록 갱신
- [x] 최대 주소 수 제약 확인

---

## Frontend E2E

### 주소 검색 → 등록 플로우
- [x] 주소 검색 → 자동완성 결과 표시 → 주소 선택 → 별칭 입력 → 저장 → 목록에 반영
