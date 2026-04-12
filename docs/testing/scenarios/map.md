# 지도 (Map) 테스트 시나리오

## Frontend Hook 테스트

### useUserLocation
- [x] Redux에 위치 없음 — latitude/longitude undefined, hasLocation false
- [x] Redux에 유효 위치 — latitude/longitude 숫자 반환, hasLocation true
- [x] 숫자가 아닌 값(문자열/null) — hasLocation false 처리
- [x] address 동기 반환 — Redux 주소 그대로 노출
- [x] Redux 위치 업데이트 — 변경된 값 즉시 반영

### useGoogleMap

> **Mock 전략**:
> - `vi.mock('@shared/utils/googleMapLoader', () => ({ loadGoogleMaps: vi.fn().mockResolvedValue({ maps, marker: markerLib }), getGoogleMapId: vi.fn(() => 'test-map-id') }))`
> - `window.google.maps` stub — `Map`, `LatLngBounds`, `InfoWindow`, `event.trigger` 최소 구현
> - `markerLib.AdvancedMarkerElement` stub — `position/map/title/content` 저장 + `addListener` mock
> - `@shared/utils/googleMap` 의 `getLatLngFromRestaurant`, `createUserLocationMarkerContent` 는 실제 구현 사용 (순수 함수) 또는 필요 시 mock
> - `react-i18next` 의 `useTranslation` — `{ t: (k) => k }` stub
> - `dompurify.sanitize` 는 identity mock 가능
> - 내부 `requestAnimationFrame`/`setTimeout` 기반 안정화 로직은 구현 세부이므로 검증 대상 제외 (전략 §4.1). 최종 관찰 가능한 상태(`loading`, `runtimeError`) 와 Map/Marker 생성자 호출 인자만 검증한다.

- [x] 초기 상태 — loading true, runtimeError null
- [x] loadGoogleMaps 성공 → 지도 초기화 + loading false
- [x] loadGoogleMaps 실패 → runtimeError 설정 + loading false
- [ ] 레스토랑 마커 렌더링 — 전달된 places 각 항목에 마커 생성
- [ ] 선택된 레스토랑 강조 — selectedId 변경 시 해당 마커 하이라이트
- [ ] InfoWindow 표시/숨김 — 마커 클릭 시 InfoWindow 표시
- [ ] 사용자 위치 마커 — 사용자 위치 props 있으면 전용 마커 표시
- [ ] fitBounds — 다수 마커 기준 뷰포트 조정 호출 확인 (의도된 공개 동작)
- [ ] 언마운트 시 리스너/마커 정리

> 참고: useGoogleMap 내부의 requestAnimationFrame/setTimeout 기반 안정화 로직은 구현 세부이므로 직접 검증하지 않고, 최종 관찰 가능한 상태(loading/error/마커 존재)만 확인한다.

---

## Frontend E2E

### 지도에서 가게 선택 → 상세 확인
- [ ] 추천 결과 카드에서 가게 선택 → 지도에 해당 마커 포커스
- [ ] 마커 클릭 → InfoWindow에 가게 이름 노출
