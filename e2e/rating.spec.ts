/**
 * 평점(Rating) E2E 시나리오
 *
 * `docs/testing/scenarios/rating.md`의 Frontend E2E 섹션을 1:1로 커버한다.
 *
 * 모든 시나리오는 `page.route`로 BE 응답을 목킹한다. 이유:
 *   - pending은 BE 상태에 의존적이어서 격리가 어렵다
 *   - submit 500 에러 케이스는 실서버에서 재현이 까다롭다
 *   - 병렬 실행 시 spec 간 간섭 방지
 *
 * 사전 조건: `localStorage.ratingPromptNeverShow` 플래그를 removeItem 으로 초기화해
 * RatingPromptModal 이 매 테스트마다 뜨도록 한다.
 */

import { test, expect, type Page, type Route } from '@playwright/test';
import { ROUTES } from './fixtures/test-data';
import { expectToast, loginAsRegularUser } from './fixtures/test-helpers';

const PLACE_NAME = '김밥천국';

/** RatingPromptModal은 aria-labelledby="rating-prompt-title" 로 식별한다. */
function ratingDialog(page: Page) {
  return page.locator('div[role="dialog"][aria-labelledby="rating-prompt-title"]');
}

const PENDING_RESPONSE = {
  id: 1,
  placeId: 'place-1',
  placeName: PLACE_NAME,
  createdAt: '2026-04-12T00:00:00.000Z',
};

function historyItem(overrides: Partial<{
  rating: number | null;
  skipped: boolean;
}> = {}) {
  return {
    id: 1,
    placeId: 'place-1',
    placeName: PLACE_NAME,
    rating: overrides.rating ?? null,
    skipped: overrides.skipped ?? false,
    promptDismissed: false,
    createdAt: '2026-04-12T00:00:00.000Z',
  };
}

function historyResponse(item: ReturnType<typeof historyItem>) {
  return {
    items: [item],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
}

async function mockPending(page: Page) {
  await page.route('**/ratings/pending', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(PENDING_RESPONSE),
    });
  });
}

test.describe('평점', () => {
  test.beforeEach(async ({ page }) => {
    // RatingPromptModal이 떠야 하므로 never-show 플래그를 초기화한다.
    // 이 spec은 @playwright/test를 직접 import하므로 auth.fixture.ts의 page
    // 오버라이드가 적용되지 않는다. onboardingCompleted를 여기서 직접 주입한다.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.removeItem('ratingPromptNeverShow');
      } catch {
        // noop
      }
    });
  });

  test('Happy Path: 평점 프롬프트 → 이력 페이지에서 별점 제출', async ({ page }) => {
    await mockPending(page);

    // 이력 페이지: 최초엔 pending, 제출 성공 후엔 rating=3 으로 응답
    let submitted = false;
    await page.route('**/ratings/history**', async (route: Route) => {
      const body = historyResponse(
        submitted ? historyItem({ rating: 3 }) : historyItem()
      );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
    await page.route('**/ratings/submit', async (route: Route) => {
      submitted = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await loginAsRegularUser(page);

    // 1) 홈 진입 후 RatingPromptModal 노출
    const dialog = ratingDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: PLACE_NAME })).toBeVisible();

    // 2) "평점 남기기" 버튼 → /ratings/history 로 이동
    await dialog.getByRole('button', { name: '평점 남기기' }).click();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.RATINGS_HISTORY}$`));

    // 3) Pending 카드 식별
    await expect(page.getByText(PLACE_NAME)).toBeVisible();

    // 4) 별 3개 선택
    const submitRequest = page.waitForRequest(
      (req) => req.url().includes('/ratings/submit') && req.method() === 'POST'
    );
    await page.getByRole('button', { name: '3점', exact: true }).click();

    // 5) 제출 버튼 클릭
    await page.getByRole('button', { name: '제출', exact: true }).click();
    await submitRequest;

    // 6) 성공 토스트
    await expectToast(page, '평점이 등록되었습니다');

    // 7) 카드가 평가 완료 상태로 갱신됨 (ReadOnlyStars + 평가 완료 뱃지)
    await expect(page.getByText('평가 완료')).toBeVisible();
  });

  test('Alternate Path: "안 갔어요"로 평점 skip', async ({ page }) => {
    await mockPending(page);
    await page.route('**/ratings/skip', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await loginAsRegularUser(page);

    const dialog = ratingDialog(page);
    await expect(dialog).toBeVisible();

    const skipRequest = page.waitForRequest(
      (req) => req.url().includes('/ratings/skip') && req.method() === 'POST'
    );
    await dialog.getByRole('button', { name: '안 갔어요', exact: true }).click();
    await skipRequest;

    // 모달 닫힘 + 메인 URL 유지
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
  });

  test('Error Case: 제출 API 실패 시 에러 토스트 + 카드 유지', async ({ page }) => {
    await mockPending(page);

    await page.route('**/ratings/history**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(historyResponse(historyItem())),
      });
    });
    await page.route('**/ratings/submit', async (route: Route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: '서버 오류' }),
      });
    });

    await loginAsRegularUser(page);

    // 모달을 거치지 않고 바로 이력 페이지로 이동
    const dialog = ratingDialog(page);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: '평점 남기기' }).click();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.RATINGS_HISTORY}$`));

    // 별점 선택 → 제출
    await page.getByRole('button', { name: '3점', exact: true }).click();
    await page.getByRole('button', { name: '제출', exact: true }).click();

    // 에러 토스트 노출
    await expectToast(page, /평점|실패|오류/);

    // Pending 카드가 여전히 목록에 존재 (별점 입력 버튼 유지)
    await expect(page.getByRole('button', { name: '3점', exact: true })).toBeVisible();
    await expect(page.getByText('평가 완료')).toBeHidden();
  });
});
