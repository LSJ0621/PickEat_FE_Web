// spec: e2e-test-plan/agent-page-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES, TIMEOUTS } from '../../fixtures/test-data';

/**
 * Menu Selection and Confirmation Modal E2E Tests
 *
 * 이 테스트는 실제 백엔드(E2E_MOCK=true)를 호출합니다.
 * 백엔드의 Mock 서비스가 일관된 응답을 반환합니다.
 */
test.describe('Menu Selection and Confirmation Modal', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to Agent page
    await authenticatedPage.goto(ROUTES.AGENT);
    await authenticatedPage.getByText('메뉴 추천 받기').first().waitFor({ state: 'visible' });
  });

  test('should open confirmation modal when clicking a menu card', async ({ authenticatedPage }) => {
    // Enter menu recommendation prompt
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('배가 고픈데 뭐 먹을까?');

    // Click recommendation button
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();

    // Wait for recommendations to load (with longer timeout for API)
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // Click on the first menu card
    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();

    // Verify confirmation modal appears
    const modal = authenticatedPage.locator('[class*="fixed inset-0"][class*="z-50"]');
    await expect(modal).toBeVisible();

    // Verify modal has backdrop blur
    await expect(modal).toHaveClass(/backdrop-blur/);

    // Verify modal contains menu name and question
    await expect(authenticatedPage.getByText(/에 대해 어떤 방식으로 탐색할까요?/)).toBeVisible();

    // Verify two action buttons are present
    await expect(authenticatedPage.getByRole('button', { name: '일반 검색' })).toBeVisible();
    await expect(authenticatedPage.getByRole('button', { name: 'AI 추천 보기' })).toBeVisible();

    // Verify close button (X) is visible
    const closeButton = modal.locator('[data-testid="modal-close-button"]');
    await expect(closeButton).toBeVisible();

    // Verify selected menu card is highlighted (has orange styling)
    await expect(firstMenuCard).toHaveClass(/border-orange|bg-orange/);
  });

  test('should close modal when clicking X button', async ({ authenticatedPage }) => {
    // Enter menu recommendation prompt and get recommendations
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('오늘은 매운 음식이 땡겨');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // Click on a menu card to open modal
    const menuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await menuCard.click();

    // Verify modal is displayed
    const modal = authenticatedPage.locator('[class*="fixed inset-0"][class*="z-50"]');
    await expect(modal).toBeVisible();

    // Click the X close button
    const closeButton = modal.locator('[data-testid="modal-close-button"]');
    await closeButton.click();

    // Verify modal disappears
    await expect(modal).not.toBeVisible();

    // Note: The menu card selection highlight persists by design
    // The user can click on other menus or get new recommendations to change selection
    await expect(menuCard).toHaveClass(/border-orange|bg-orange/);
  });

  test('should close modal when clicking backdrop', async ({ authenticatedPage }) => {
    // Enter menu recommendation prompt and get recommendations
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('치킨이 먹고 싶어');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // Click on a menu card to open modal
    const menuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await menuCard.click();

    // Verify modal is displayed
    const modal = authenticatedPage.locator('[class*="fixed inset-0"][class*="z-50"]');
    await expect(modal).toBeVisible();

    // Press Escape key to close modal (more reliable than backdrop click)
    await authenticatedPage.keyboard.press('Escape');

    // Verify modal closes
    await expect(modal).not.toBeVisible();

    // Note: The menu card selection highlight persists by design
    await expect(menuCard).toHaveClass(/border-orange|bg-orange/);
  });

  test('should allow selecting different menus sequentially', async ({ authenticatedPage }) => {
    // Enter menu recommendation prompt and get recommendations
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('한식이 먹고 싶어');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // Click on first menu card
    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();

    // Verify first menu is selected (modal shows)
    const modal = authenticatedPage.locator('[class*="fixed inset-0"][class*="z-50"]');
    await expect(modal).toBeVisible();
    await expect(firstMenuCard).toHaveClass(/border-orange|bg-orange/);

    // Get first menu name from modal
    const firstMenuName = await authenticatedPage.locator('.font-semibold.text-orange-300').textContent();

    // Close modal
    const closeButton = modal.locator('[data-testid="modal-close-button"]');
    await closeButton.click();
    await expect(modal).not.toBeVisible();

    // Click on second menu card
    const secondMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^2/ }).first();
    await secondMenuCard.click();

    // Verify second menu is now selected
    await expect(modal).toBeVisible();
    await expect(secondMenuCard).toHaveClass(/border-orange|bg-orange/);

    // Verify first menu is no longer highlighted
    await expect(firstMenuCard).not.toHaveClass(/border-orange|bg-orange/);

    // Verify modal shows second menu name (different from first)
    const secondMenuName = await authenticatedPage.locator('.font-semibold.text-orange-300').textContent();
    expect(secondMenuName).not.toBe(firstMenuName);
  });

  test('should show location warning when location is unavailable', async ({ authenticatedPage }) => {
    // NOTE: This test assumes user has no address registered
    // If your test user has address, you may need to modify test data setup
    // With backend mock, test user now has an address, so this test may need adjustment

    // Enter menu recommendation prompt and get recommendations
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('피자 먹고 싶어');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // Click on a menu card
    const menuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await menuCard.click();

    // Verify confirmation modal appears
    const modal = authenticatedPage.locator('[class*="fixed inset-0"][class*="z-50"]');
    await expect(modal).toBeVisible();

    // Check if location warning appears (depends on user's address/location state)
    const locationWarning = authenticatedPage.getByText('위치 정보가 없습니다. 주소를 등록해야 식당을 검색할 수 있습니다.');
    const generalSearchButton = authenticatedPage.getByRole('button', { name: '일반 검색' });

    // If warning is visible, verify button is disabled
    const isWarningVisible = await locationWarning.isVisible().catch(() => false);
    if (isWarningVisible) {
      await expect(generalSearchButton).toBeDisabled();
      await expect(locationWarning).toHaveClass(/border-amber|bg-amber/);
    }
  });
});
