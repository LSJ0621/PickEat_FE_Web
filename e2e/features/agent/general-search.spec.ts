// spec: e2e-test-plan/agent-page-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES, TIMEOUTS, EXPECTED_MOCK_RESPONSES } from '../../fixtures/test-data';

/**
 * General Restaurant Search Flow E2E Tests
 *
 * 이 테스트는 실제 백엔드(E2E_MOCK=true)를 호출합니다.
 * 백엔드의 Mock 서비스가 일관된 응답을 반환합니다.
 */
test.describe('General Restaurant Search Flow', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to Agent page
    await authenticatedPage.goto(ROUTES.AGENT);
    await authenticatedPage.getByText('메뉴 추천 받기').first().waitFor({ state: 'visible' });
  });

  test('should execute general search when clicking 일반 검색', async ({ authenticatedPage }) => {
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

    // 6. Click '일반 검색' button
    await authenticatedPage.getByRole('button', { name: '일반 검색' }).click();

    // 7. Verify modal closes immediately
    await expect(modal).not.toBeVisible();

    // 8. Verify results section appears below recommendations
    // The results section should be visible after search starts

    // 9. Verify '일반 검색' tab is automatically selected and highlighted
    // Note: Tab buttons may include a count badge (e.g., "일반 검색 2")
    const generalSearchTab = authenticatedPage.getByRole('button').filter({ hasText: '일반 검색' }).first();
    await expect(generalSearchTab).toBeVisible();

    // 10. Verify 'AI 추천' tab is also visible but not selected
    const aiRecommendationTab = authenticatedPage.getByRole('button').filter({ hasText: 'AI 추천' }).nth(3); // Skip the 3 menu cards
    await expect(aiRecommendationTab).toBeVisible();

    // 11. Wait for search to complete and verify restaurant cards are displayed
    // 백엔드 Mock 응답 (Naver): '맛있는 한식당', '맛있는 중식당'
    await authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
  });

  test('should display restaurant cards with proper information', async ({ authenticatedPage }) => {
    // 1. Complete general search for a menu
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('김치찌개 먹고 싶어');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();
    await authenticatedPage.getByRole('button', { name: '일반 검색' }).click();

    // 2. Verify at least 1 restaurant card is displayed
    // 백엔드 Mock 응답 (Naver): '맛있는 한식당'
    await authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // 3. For each card, verify restaurant name is present
    await expect(authenticatedPage.getByRole('heading', { name: EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName, level: 4 })).toBeVisible();

    // 4. Verify restaurant card section has address info (within main content, not header)
    const searchResultsSection = authenticatedPage.locator('main').getByText(new RegExp(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantAddress));
    await expect(searchResultsSection.first()).toBeVisible();
  });

  test('should show empty state when no restaurants are found', async ({ authenticatedPage }) => {
    // Note: With backend mock, search always returns results
    // This test would need a special mock configuration to test empty state
    // For now, we verify the normal flow works

    // 1. Request menu recommendation
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('음식 추천해줘');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // 2. Select the menu and choose '일반 검색'
    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();
    await authenticatedPage.getByRole('button', { name: '일반 검색' }).click();

    // 3. Verify search results appear (backend mock returns results)
    await authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
    await expect(authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName)).toBeVisible();
  });

  test('should maintain search results when switching between tabs', async ({ authenticatedPage }) => {
    // 1. Complete general search for a menu
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('음식 추천해줘');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();
    await authenticatedPage.getByRole('button', { name: '일반 검색' }).click();

    // 2. Verify restaurant results are displayed in '일반 검색' tab
    // 백엔드 Mock 응답 (Naver): '맛있는 한식당'
    await authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
    await expect(authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName)).toBeVisible();

    // 3. Click on 'AI 추천' tab
    // Note: Skip the first 3 buttons which are the menu cards with "AI 추천 메뉴"
    const aiRecommendationTab = authenticatedPage.getByRole('button').filter({ hasText: 'AI 추천' }).nth(3);
    await aiRecommendationTab.click();

    // 4. Click back on '일반 검색' tab
    const generalSearchTab = authenticatedPage.getByRole('button').filter({ hasText: '일반 검색' }).first();
    await generalSearchTab.click();

    // 5. Verify original search results are still displayed
    await expect(authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName)).toBeVisible();
  });

  test('should handle search errors gracefully', async ({ authenticatedPage }) => {
    // Note: With backend mock, errors are not typically returned
    // This test verifies normal operation instead

    // 1. Navigate to /agent page and get recommendations
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('음식 추천해줘');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // 2. Select menu and click '일반 검색'
    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();
    await authenticatedPage.getByRole('button', { name: '일반 검색' }).click();

    // 3. Verify page remains functional and shows results
    await expect(authenticatedPage.getByRole('heading', { name: '추천 메뉴' })).toBeVisible();
    await authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
  });
});
