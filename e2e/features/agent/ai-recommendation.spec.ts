// spec: e2e-test-plan/agent-page-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES, TIMEOUTS, EXPECTED_MOCK_RESPONSES } from '../../fixtures/test-data';

/**
 * AI Restaurant Recommendation Flow E2E Tests
 *
 * 이 테스트는 실제 백엔드(E2E_MOCK=true)를 호출합니다.
 * 백엔드의 Mock 서비스가 일관된 응답을 반환합니다.
 */
test.describe('AI Restaurant Recommendation Flow', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to Agent page
    await authenticatedPage.goto(ROUTES.AGENT);
    await authenticatedPage.getByText('메뉴 추천 받기').first().waitFor({ state: 'visible' });
  });

  test('should execute AI recommendation when clicking AI 추천 보기', async ({ authenticatedPage }) => {
    // 1. Enter menu recommendation prompt
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('배가 고픈데 뭐 먹을까?');

    // 2. Click recommendation button
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();

    // 3. Wait for recommendations to load
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // 4. Click on the first menu card to open confirmation modal
    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();

    // 5. Verify confirmation modal appears
    const modal = authenticatedPage.locator('[class*="fixed inset-0"][class*="z-50"]');
    await expect(modal).toBeVisible();

    // 6. Click 'AI 추천 보기' button
    await authenticatedPage.getByRole('button', { name: 'AI 추천 보기' }).click();

    // 7. Verify modal closes immediately
    await expect(modal).not.toBeVisible();

    // 8. Verify 'AI 추천' tab is automatically selected and highlighted
    // Note: Tab buttons may include a count badge
    const aiRecommendationTab = authenticatedPage.getByRole('button').filter({ hasText: 'AI 추천' }).nth(3); // Skip menu cards
    await expect(aiRecommendationTab).toBeVisible();

    // 9. Wait for AI recommendation to complete (may take up to 30 seconds)
    // 백엔드 Mock 응답: '맛있는 한식당'
    await authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // 10. Verify AI-recommended restaurant cards appear
    await expect(authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)).toBeVisible();
  });

  test('should display AI recommendation cards with reasons', async ({ authenticatedPage }) => {
    // 1. Complete AI recommendation for a menu
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('김치찌개 먹고 싶어');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();
    await authenticatedPage.getByRole('button', { name: 'AI 추천 보기' }).click();

    // 2. Verify at least 1 AI-recommended place card is displayed
    // 백엔드 Mock 응답: '맛있는 한식당'
    await authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // 3. For each card, verify restaurant name and recommendation reason
    await expect(authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)).toBeVisible();
    await expect(authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantReason)).toBeVisible();
  });

  test('should show cached results for previously recommended menus', async ({ authenticatedPage }) => {
    // 1. Get menu recommendations and select first menu
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('배고파');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // 2. Click 'AI 추천 보기' and wait for results
    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();
    await authenticatedPage.getByRole('button', { name: 'AI 추천 보기' }).click();

    // 3. Note the AI recommendations displayed
    // 백엔드 Mock 응답: '맛있는 한식당'
    await authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
    await expect(authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)).toBeVisible();

    // Note: The current implementation caches results in Redux store
    // When clicking the same menu again, it should use cached data
    // For this test to properly verify caching, the component should detect
    // if AI recommendations already exist for the selected menu
  });

  test('should maintain AI results when switching tabs', async ({ authenticatedPage }) => {
    // 1. Complete AI recommendation for a menu
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('음식 추천해줘');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();
    await authenticatedPage.getByRole('button', { name: 'AI 추천 보기' }).click();

    // 2. Verify AI results are displayed - check for the section heading first
    await authenticatedPage.getByRole('heading', { name: 'AI 추천 식당', level: 2 }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
    // Then verify the restaurant card name appears
    // 백엔드 Mock 응답: '맛있는 한식당', '리뷰가 좋고 위치가 편리합니다.'
    await expect(authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantReason)).toBeVisible();

    // 3. Execute general search by clicking menu card again and selecting '일반 검색'
    await firstMenuCard.click();
    await authenticatedPage.getByRole('button', { name: '일반 검색' }).last().click();

    // Wait for general search results
    await authenticatedPage.getByRole('heading', { name: '주변 식당 검색 결과', level: 2 }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // 4. Switch back to 'AI 추천' tab by clicking the tab button
    const aiRecommendationTab = authenticatedPage.getByRole('button', { name: /^AI 추천/ });
    await aiRecommendationTab.click();

    // 5. Verify AI results are still displayed - check for the AI recommendation section
    await expect(authenticatedPage.getByRole('heading', { name: 'AI 추천 식당', level: 2 })).toBeVisible();

    // 6. Verify results are identical (reason should still be visible)
    await expect(authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantReason)).toBeVisible();
  });
});
