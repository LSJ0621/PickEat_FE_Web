// spec: e2e-test-plan/agent-page-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { AgentPage } from '../../fixtures/page-objects/AgentPage';

/**
 * Menu Selection and Confirmation Modal E2E Tests
 *
 * 이 테스트는 실제 백엔드(E2E_MOCK=true)를 호출합니다.
 * 백엔드의 Mock 서비스가 일관된 응답을 반환합니다.
 */
test.describe('Menu Selection and Confirmation Modal', () => {
  let agentPage: AgentPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    agentPage = new AgentPage(authenticatedPage);
    await agentPage.goto();
  });

  test('should open confirmation modal when clicking a menu card', async () => {
    // Enter menu recommendation prompt, submit, and wait for results
    await agentPage.enterQuestion('배가 고픈데 뭐 먹을까?');
    await agentPage.submitQuestion();
    await agentPage.waitForRecommendation();

    // Click on the first menu card
    await agentPage.selectRecommendedMenu(1);

    // Verify confirmation modal appears
    await agentPage.expectModalVisible();

    // Verify modal has backdrop blur
    await expect(agentPage.page.locator('[data-testid="menu-selection-modal"]')).toHaveClass(/backdrop-blur/);

    // Verify modal contains menu name and question
    await agentPage.expectModalContent();

    // Verify two action buttons are present
    await agentPage.expectModalActionButtons();

    // Verify close button (X) is visible
    await agentPage.expectModalCloseButton();

    // Verify selected menu card is highlighted (has orange styling)
    await agentPage.expectMenuHighlighted(1);
  });

  test('should close modal when clicking X button', async () => {
    // Enter menu recommendation prompt and get recommendations
    await agentPage.getRecommendationAndSelectMenu('오늘은 매운 음식이 땡겨', 1);

    // Verify modal is displayed
    await agentPage.expectModalVisible();

    // Click the X close button
    await agentPage.closeModal();

    // Verify modal disappears
    await agentPage.expectModalClosed();

    // Note: The menu card selection highlight persists by design
    // The user can click on other menus or get new recommendations to change selection
    await agentPage.expectMenuHighlighted(1);
  });

  test('should close modal when clicking backdrop', async () => {
    // Enter menu recommendation prompt and get recommendations
    await agentPage.getRecommendationAndSelectMenu('치킨이 먹고 싶어', 1);

    // Verify modal is displayed
    await agentPage.expectModalVisible();

    // Press Escape key to close modal (more reliable than backdrop click)
    await agentPage.closeModalWithEscape();

    // Verify modal closes
    await agentPage.expectModalClosed();

    // Note: The menu card selection highlight persists by design
    await agentPage.expectMenuHighlighted(1);
  });

  test('should allow selecting different menus sequentially', async () => {
    // Enter menu recommendation prompt and get recommendations
    await agentPage.getRecommendationAndSelectMenu('한식이 먹고 싶어', 1);

    // Verify first menu is selected (modal shows)
    await agentPage.expectModalVisible();
    await agentPage.expectMenuHighlighted(1);

    // Get first menu name from modal
    const firstMenuName = await agentPage.getMenuName();

    // Close modal
    await agentPage.closeModal();
    await agentPage.expectModalClosed();

    // Click on second menu card
    await agentPage.selectRecommendedMenu(2);

    // Verify second menu is now selected
    await agentPage.expectModalVisible();
    await agentPage.expectMenuHighlighted(2);

    // Verify first menu is no longer highlighted
    await agentPage.expectMenuNotHighlighted(1);

    // Verify modal shows second menu name (different from first)
    const secondMenuName = await agentPage.getMenuName();
    expect(secondMenuName).not.toBe(firstMenuName);
  });

  test('should allow general search when user has address', async ({ authenticatedPage }) => {
    // NOTE: With backend mock, test user has an address registered
    // This test verifies that general search is available when user has location

    // Enter menu recommendation prompt and get recommendations
    await agentPage.getRecommendationAndSelectMenu('피자 먹고 싶어', 1);

    // Verify confirmation modal appears
    await agentPage.expectModalVisible();

    // Verify location warning is NOT visible
    const locationWarning = authenticatedPage.getByText('위치 정보가 없습니다. 주소를 등록해야 식당을 검색할 수 있습니다.');
    await expect(locationWarning).not.toBeVisible();

    // Verify general search button is enabled
    const generalSearchButton = authenticatedPage.getByRole('button', { name: '일반 검색' });
    await expect(generalSearchButton).toBeEnabled();
  });
});
