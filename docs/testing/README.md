# PickEat Frontend 테스트 문서

이 디렉토리는 PickEat **Frontend**의 테스트 전략, 시나리오, 결과, 회고록을 담고 있습니다.

## 문서 구조

### 📋 [테스트 전략 (test-strategy.md)](./test-strategy.md)
테스트 작성의 원칙과 규칙. 무엇을 테스트하고 무엇을 테스트하지 않을지 결정하는 기준.

### 📁 [시나리오 (scenarios/)](./scenarios/)
기능별 테스트 시나리오 체크리스트. 각 `[x]` / `[ ]`가 실제 테스트 코드와 1:1 매칭.

### 🔍 [회고록 (retrospective.md)](./retrospective.md) ⭐
테스트 전략을 현실에 적용하면서 발생한 주요 이슈의 근본 원인 분석과 교훈.
- **Playwright 병렬 경합** — 테스트 격리 vs 병렬 속도 trade-off
- **전략 §4.1 "내부 훅 의존성 원칙" 신설** — 전략 문서의 살아있는 계약성

## 빠른 시작

### 테스트 실행
```bash
# Vitest (Hook + Utils, 커버리지 포함)
npm run test:coverage

# Playwright E2E (BE/FE 서버 자동 기동)
npm run test:e2e
```

## 결과

### 테스트 건수 및 커버리지

| Layer | Tests | Lines | Statements | Branches | Functions |
|---|---|---|---|---|---|
| Vitest (Hooks + Utils) | 384 | **83.31%** | 82.94% | 60.95% | 88.97% |
| Playwright E2E (11 × 2 브라우저) | 22 | — | — | — | — |
| **합계** | **406** | | | | |

> **커버리지 scope**: 컴포넌트 / 페이지 / store / API 레이어는 의도적으로 **커버리지 대상에서 제외**되었습니다.
> 근거는 `vitest.config.ts` 주석과 `test-strategy.md` 참조.
> Playwright E2E는 브라우저에서 실제 사용자 경로를 검증하며, 코드 라인 커버리지 대신 **시나리오 통과**로 검증합니다.

### 기능별 시나리오 커버리지 맵

| 기능 | 시나리오 문서 | Vitest | Playwright E2E |
|---|---|---|---|
| 인증 | [auth.md](./scenarios/auth.md) | 12/12 ✅ | 1/1 ✅ |
| 메뉴 추천 | [menu-recommendation.md](./scenarios/menu-recommendation.md) | 11/11 ✅ | 1/1 ✅ |
| 주소 | [address.md](./scenarios/address.md) | 19/19 ✅ | 1/1 ✅ |
| 평점 | [rating.md](./scenarios/rating.md) | 11/11 ✅ | 3/3 ✅ |
| 사용자 | [user.md](./scenarios/user.md) | 20/20 ✅ | 2/2 ✅ |
| 버그 리포트 | [bug-report.md](./scenarios/bug-report.md) | - | 3/3 ✅ |
| 히스토리 | [history.md](./scenarios/history.md) | 9/9 ✅ | - |
| 에이전트 | [agent.md](./scenarios/agent.md) | 13/13 ✅ | - |
| 공통 인프라 | [common.md](./scenarios/common.md) | 183/183 ✅ | - |

> Playwright 컬럼은 브라우저 1개 기준 테스트 수입니다.
> 실제 실행은 **chromium + mobile-chrome 2개 브라우저 × 11 tests = 22 runs**.

## 포트폴리오 포인트

1. **테스트 대상 scope 명시** — `vitest.config.ts`에 `include: hooks + utils`만 지정, 컴포넌트/페이지 제외. 의사결정이 설정 파일에 그대로 박제됨
2. **접근성 기반 셀렉터** — `getByLabel` / `getByRole` 100% 전환, CSS `#id` 0건
3. **Playwright 안정성 설계** — `workers: 1` + auth fixture 격리로 flaky test 제거 (회고록 참조)
4. **회고록을 통한 시스템 개선** — 병렬 경합 3단계 분석 + §4.1 내부 훅 의존성 원칙 신설

## 관련 프로젝트

- [PickEat Backend (pick-eat_be)](https://github.com/LSJ0621/PickEat_BE) — Backend 테스트 문서는 해당 리포의 `docs/testing/` 참조
