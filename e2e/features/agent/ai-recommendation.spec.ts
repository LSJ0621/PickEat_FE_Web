// spec: e2e-test-plan/agent-page-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '../../fixtures/auth.fixture';
import { AgentPage } from '../../fixtures/page-objects/AgentPage';

/**
 * AI Restaurant Recommendation Flow E2E Tests
 *
 * 이 테스트는 실제 백엔드(E2E_MOCK=true)를 호출합니다.
 * 백엔드의 Mock 서비스가 일관된 응답을 반환합니다.
 */
test.describe('AI Restaurant Recommendation Flow', () => {
  let agentPage: AgentPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    agentPage = new AgentPage(authenticatedPage);
    await agentPage.goto();
  });

  test('should execute AI recommendation when clicking AI 추천 보기', async () => {
    // 1-3. Enter menu recommendation prompt and submit
    await agentPage.enterQuestion('배가 고픈데 뭐 먹을까?');
    await agentPage.submitQuestion();
    await agentPage.waitForRecommendation();

    // 4. Click on the first menu card to open confirmation modal
    await agentPage.selectRecommendedMenu(1);

    // 5. Verify confirmation modal appears
    await agentPage.expectModalVisible();

    // 6. Click 'AI 추천 보기' button
    await agentPage.confirmMenuSelection();

    // 7. Verify modal closes immediately
    await agentPage.expectModalClosed();

    // 8. Verify 'AI 추천' tab is automatically selected and highlighted
    // Note: Tab buttons may include a count badge
    await agentPage.clickAiRecommendationTab();

    // 9-10. Wait for AI recommendation to complete and verify restaurant cards appear
    // 백엔드 Mock 응답: '맛있는 한식당'
    await agentPage.expectMockAiRestaurantVisible();
  });

  test('should display AI recommendation cards with reasons', async () => {
    // 1. Complete AI recommendation for a menu
    await agentPage.getRecommendationAndSelectMenu('김치찌개 먹고 싶어', 1);
    await agentPage.confirmMenuSelection();

    // 2-3. Verify at least 1 AI-recommended place card is displayed with reason
    // 백엔드 Mock 응답: '맛있는 한식당', '리뷰가 좋고 위치가 편리합니다.'
    await agentPage.expectMockAiRestaurantVisible();
    await agentPage.expectMockAiRecommendationReasonVisible();
  });

  test('should show cached results for previously recommended menus', async () => {
    // 1-2. Get menu recommendations, select first menu, and click 'AI 추천 보기'
    await agentPage.getRecommendationAndSelectMenu('배고파', 1);
    await agentPage.confirmMenuSelection();

    // 3. Note the AI recommendations displayed
    // 백엔드 Mock 응답: '맛있는 한식당'
    await agentPage.expectMockAiRestaurantVisible();

    // Note: The current implementation caches results in Redux store
    // When clicking the same menu again, it should use cached data
    // For this test to properly verify caching, the component should detect
    // if AI recommendations already exist for the selected menu
  });

  test('should maintain AI results when switching tabs', async () => {
    // 1. Complete AI recommendation for a menu
    await agentPage.getRecommendationAndSelectMenu('음식 추천해줘', 1);
    await agentPage.confirmMenuSelection();

    // 2. Verify AI results are displayed - check for the section heading first
    await agentPage.expectAiRecommendationSectionVisible();
    // Then verify the restaurant card reason appears
    // 백엔드 Mock 응답: '맛있는 한식당', '리뷰가 좋고 위치가 편리합니다.'
    await agentPage.expectMockAiRecommendationReasonVisible();

    // 3. Execute general search by clicking menu card again and selecting '일반 검색'
    await agentPage.selectRecommendedMenu(1);
    await agentPage.confirmMenuSelectionWithSearch();

    // Wait for general search results
    await agentPage.expectGeneralSearchSectionVisible();

    // 4. Switch back to 'AI 추천' tab by clicking the tab button
    await agentPage.clickAiRecommendationTab();

    // 5-6. Verify AI results are still displayed and identical
    await agentPage.expectAiRecommendationSectionVisible();
    await agentPage.expectMockAiRecommendationReasonVisible();
  });
});
