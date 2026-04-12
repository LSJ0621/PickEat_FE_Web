/**
 * 메뉴 추천 E2E 테스트
 *
 * 시나리오: 프롬프트 입력 → AI 응답 수신 → 추천 메뉴 표시 → 메뉴 선택 → 맛집 추천 → 지도 확인
 *
 * 사전 조건:
 * - 백엔드가 NODE_ENV=test, E2E_MOCK=true 로 실행되어 있다.
 * - 시드된 일반 유저(test@example.com)에는 기본 주소만 설정되어 있으므로,
 *   `/agent` 접근 전에 birthDate/gender/preferences 를 추가로 세팅한다
 *   (미설정 시 `/mypage` 로 리디렉션됨).
 * - Mock 메뉴 추천 응답: ['김치찌개', '된장찌개', '순두부찌개']
 * - Mock 맛집 추천 응답: '테스트 맛집 1', '테스트 맛집 2'
 */

import { test, expect } from './fixtures/auth.fixture';
import { ROUTES } from './fixtures/test-data';

const API_BASE_URL = 'http://localhost:3000';

async function ensureAgentReady(page: import('@playwright/test').Page): Promise<void> {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token, 'login should populate token in localStorage').toBeTruthy();

  const authHeader = { Authorization: `Bearer ${token}` };

  // birthDate / gender 세팅
  const profileRes = await page.request.patch(`${API_BASE_URL}/user`, {
    headers: authHeader,
    data: { birthDate: '1990-01-01', gender: 'male' },
  });
  expect(profileRes.ok(), `PATCH /user: ${profileRes.status()}`).toBeTruthy();

  // 선호도 세팅
  const prefsRes = await page.request.post(`${API_BASE_URL}/user/preferences`, {
    headers: authHeader,
    data: { likes: ['한식'], dislikes: [] },
  });
  expect(prefsRes.ok(), `POST /user/preferences: ${prefsRes.status()}`).toBeTruthy();
}

test.describe('메뉴 추천', () => {
  test.setTimeout(90_000);

  test('프롬프트 입력 → AI 응답 → 메뉴 선택 → 맛집 추천', async ({ authedPage }) => {
    // 1) 사전 세팅: birthDate/gender/preferences 추가 → /agent 리디렉션 방지
    await ensureAgentReady(authedPage);

    // 2) /agent 진입 (auth.me 재조회 → Redux 상태 업데이트)
    await authedPage.goto(ROUTES.AGENT);
    await expect(authedPage).toHaveURL(new RegExp(`${ROUTES.AGENT}$`));

    // 3) 프롬프트 입력 & 추천 요청
    const promptInput = authedPage.getByLabel('어떤 메뉴를 원하시나요?');
    await expect(promptInput).toBeVisible();
    await promptInput.fill('오늘 점심으로 따뜻한 한식이 먹고 싶어');

    await authedPage
      .getByRole('button', { name: '메뉴 추천 받기', exact: true })
      .click();

    // 4) SSE 스트리밍 대기 → 추천 메뉴 카드 표시 확인
    //    Mock 응답: 김치찌개/된장찌개/순두부찌개
    const firstMenuButton = authedPage.getByRole('button', { name: '김치찌개 선택' });
    await expect(firstMenuButton).toBeVisible({ timeout: 30000 });
    await expect(
      authedPage.getByRole('button', { name: '된장찌개 선택' })
    ).toBeVisible();
    await expect(
      authedPage.getByRole('button', { name: '순두부찌개 선택' })
    ).toBeVisible();

    // 5) 메뉴 카드 클릭 → 선택 확인 모달 표시
    await firstMenuButton.click();

    const confirmModal = authedPage.getByTestId('menu-selection-modal');
    await expect(confirmModal).toBeVisible();
    await expect(authedPage.getByTestId('selected-menu-name')).toHaveText('김치찌개');

    // 6) "확인" 버튼 클릭 → AI 맛집 추천 요청 (search + community SSE)
    await confirmModal.getByRole('button', { name: '확인', exact: true }).click();

    // 모달이 닫히고 결과 섹션으로 전환되는 것을 대기
    await expect(confirmModal).toBeHidden({ timeout: 10000 });

    // 7) AI 추천 결과에서 mock 맛집 이름 노출 확인
    await expect(
      authedPage.getByRole('button', { name: /테스트 맛집 1/ })
    ).toBeVisible({ timeout: 30000 });

    // 8) URL 은 /agent 유지
    await expect(authedPage).toHaveURL(new RegExp(`${ROUTES.AGENT}$`));
  });
});
