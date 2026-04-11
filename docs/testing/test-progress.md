# PickEat Frontend 테스트 진행 현황

> 이 문서는 **AI가 세션 시작 시 가장 먼저 읽어야 하는 문서**입니다.
> 전체 진행 상황을 파악하고, 다음 작업을 결정하는 데 사용합니다.

## 참조 문서

- 테스트 전략/철학/규칙: [test-strategy.md](./test-strategy.md)
- 기능별 상세 시나리오: [scenarios/](./scenarios/)

---

## 전체 진행 현황

> 형식: 테스트 수/시나리오 수 (테스트가 있는 시나리오만 ✅)

| 기능 | 시나리오 문서 | FE Hook | FE E2E | 상태 |
|------|-------------|---------|--------|------|
| 인증 | [auth.md](scenarios/auth.md) | 12/12 ✅ | 3/3 ✅ | **완료** |
| 메뉴 추천 | [menu-recommendation.md](scenarios/menu-recommendation.md) | 11/11 ✅ | 2/2 ✅ | **완료** |
| 주소 | [address.md](scenarios/address.md) | 8/8 ✅ | 2/2 ✅ | **완료** |
| 평점 | [rating.md](scenarios/rating.md) | 11/11 ✅ | - | **완료** |
| 공통 인프라 | [common.md](scenarios/common.md) | 166/166 ✅ | - | **완료** |

**FE Hook/Utils 전체**: 208 테스트 / 208 시나리오 (100% 일치)
**FE E2E 전체**: 7 테스트 / 7 시나리오 (100%)

---

## 작업 순서

### Phase 0: 준비

- [x] Frontend: 기존 테스트 파일 삭제 (setup, mocks, factories 유지) — setup/mocks/factories 모두 유지됨

### Phase 1: 인증 (auth)

2. Frontend Hook 테스트 → Frontend E2E

### Phase 2: 메뉴 추천 (menu-recommendation)

2. Frontend Hook 테스트 → Frontend E2E

### Phase 3: 주소 (address)

2. Frontend Hook 테스트 → Frontend E2E

### Phase 4: 나머지 기능

3. 평점 (rating) — FE Hook

### Phase 5: 공통 인프라

2. Frontend Utils 테스트

---

## 세션 로그

> 각 세션 종료 시 아래에 작업 내용을 기록합니다.

| 날짜 | 작업 내용 | 완료 항목 |
|------|----------|----------|
| 2026-04-10 | 테스트 전략 수립, 문서 구조 설계 | test-strategy.md, 시나리오 문서 작성 |
| 2026-04-10 | Phase 1 인증 테스트 작성 | FE Hook 12개, FE E2E 1개 |
| 2026-04-10 | Phase 2 메뉴 추천 테스트 작성 | FE Hook 10개, FE E2E 1개 |
| 2026-04-10 | Phase 3 주소 테스트 작성 | FE Hook 7개, FE E2E 1개 |
| 2026-04-10 | Phase 5 공통 인프라 테스트 작성 | FE Unit 11개 — **전체 완료** |
| 2026-04-11 | FE 테스트 개선 | E2E 에러 경로 4개 추가 (auth 2, menu 1, address 1). Utils 테스트 신규 4파일 + validation 확장 (role, userSetup, googleMap, placeDetailCache, validateBugReport). 레이스 컨디션 테스트 2개 (useAgentActions, useAddress). FE Hook/Utils 51→208, FE E2E 3→7 |

---

## AI 작업 가이드

### 세션 시작 시

1. 이 문서(`test-progress.md`)를 읽어 전체 현황 파악
2. "전체 진행 현황" 표에서 "미착수" 또는 진행 중인 기능 확인
3. 해당 기능의 `scenarios/{기능}.md`를 읽어 구체적 시나리오 확인
4. `test-strategy.md`의 규칙에 따라 테스트 작성

### 세션 종료 시

1. 완료한 시나리오의 `[ ]`를 `[x]`로 변경
2. 이 문서의 "전체 진행 현황" 표 숫자 업데이트
3. "세션 로그"에 작업 내용 기록

### 테스트 작성 순서 (각 기능 내)

```
Frontend Hook 테스트 → Frontend E2E
```

각 단계에서 `test-strategy.md`의 규칙을 따른다:
- 행동(결과) 검증, 구현 검증 금지
- Mock은 MSW로 API만
- 테스트 이름은 시나리오를 설명
- Factory로 테스트 데이터 생성
