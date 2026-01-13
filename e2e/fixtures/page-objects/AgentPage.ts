import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES, SELECTORS, TIMEOUTS, EXPECTED_MOCK_RESPONSES } from '../test-data';

/**
 * Agent Page Object
 * AI 메뉴 추천 및 식당 검색 페이지 상호작용을 위한 클래스
 */
export class AgentPage extends BasePage {
  // Locators
  private readonly questionInput = this.page.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' });
  private readonly recommendButton = this.page.getByRole('button', { name: '메뉴 추천 받기' });
  private readonly recommendationHeading = this.page.getByRole('heading', { name: '추천 메뉴' });
  private readonly generalSearchButton = this.page.getByRole('button', { name: '일반 검색' });
  private readonly aiRecommendationButton = this.page.getByRole('button', { name: 'AI 추천 보기' });

  constructor(page: Page) {
    super(page);
  }

  /**
   * 네비게이션: Agent 페이지로 이동
   */
  async goto(): Promise<void> {
    await this.page.goto(ROUTES.AGENT);
    await this.page.getByText('메뉴 추천 받기').first().waitFor({ state: 'visible' });
  }

  /**
   * AI 추천: 질문 입력
   */
  async enterQuestion(question: string): Promise<void> {
    await this.questionInput.fill(question);
  }

  /**
   * AI 추천: 추천 요청 제출
   */
  async submitQuestion(): Promise<void> {
    await this.recommendButton.click();
  }

  /**
   * AI 추천: 추천 결과 로딩 대기
   */
  async waitForRecommendation(timeout: number = TIMEOUTS.LONG): Promise<void> {
    await this.recommendationHeading.waitFor({ state: 'visible', timeout });
  }

  /**
   * 메뉴 선택: 추천된 메뉴 선택 (1-based index)
   */
  async selectRecommendedMenu(index: number): Promise<void> {
    const menuCard = this.page.getByRole('button').filter({ hasText: new RegExp(`^${index}`) }).first();
    await menuCard.click();
  }

  /**
   * 메뉴 선택: 선택 확인 (AI 추천 보기)
   */
  async confirmMenuSelection(): Promise<void> {
    await this.aiRecommendationButton.click();
  }

  /**
   * 메뉴 선택: 일반 검색으로 확인
   */
  async confirmMenuSelectionWithSearch(): Promise<void> {
    await this.generalSearchButton.click();
  }

  /**
   * 결과 확인: AI 추천 결과 표시 확인
   */
  async expectRecommendationVisible(): Promise<void> {
    await expect(this.recommendationHeading).toBeVisible();
  }

  /**
   * 결과 확인: Mock 응답 식당 이름 확인 (AI 추천)
   */
  async expectMockAiRestaurantVisible(): Promise<void> {
    await this.page.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)
      .waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
  }

  /**
   * 결과 확인: Mock 응답 식당 이름 확인 (일반 검색)
   */
  async expectMockSearchRestaurantVisible(): Promise<void> {
    await this.page.getByText(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName)
      .waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
  }

  /**
   * 결과 확인: 로딩 상태 확인
   */
  async expectLoadingState(): Promise<void> {
    await expect(this.page.locator(SELECTORS.common.loadingSpinner)).toBeVisible();
  }

  /**
   * 통합 플로우: 메뉴 추천 + 선택까지
   */
  async getRecommendationAndSelectMenu(question: string, menuIndex: number = 1): Promise<void> {
    await this.enterQuestion(question);
    await this.submitQuestion();
    await this.waitForRecommendation();
    await this.selectRecommendedMenu(menuIndex);
  }

  /**
   * 통합 플로우: AI 추천 전체 플로우
   */
  async completeAiRecommendationFlow(question: string, menuIndex: number = 1): Promise<void> {
    await this.getRecommendationAndSelectMenu(question, menuIndex);
    await this.confirmMenuSelection();
    await this.expectMockAiRestaurantVisible();
  }

  /**
   * 통합 플로우: 일반 검색 전체 플로우
   */
  async completeGeneralSearchFlow(question: string, menuIndex: number = 1): Promise<void> {
    await this.getRecommendationAndSelectMenu(question, menuIndex);
    await this.confirmMenuSelectionWithSearch();
    await this.expectMockSearchRestaurantVisible();
  }

  /**
   * 모달: 확인 모달이 표시되는지 확인
   */
  async expectModalVisible(): Promise<void> {
    const modal = this.page.locator('[data-testid="menu-selection-modal"]');
    await expect(modal).toBeVisible();
  }

  /**
   * 모달: 확인 모달이 닫혔는지 확인
   */
  async expectModalClosed(): Promise<void> {
    const modal = this.page.locator('[data-testid="menu-selection-modal"]');
    await expect(modal).not.toBeVisible();
  }

  /**
   * 모달: X 버튼으로 모달 닫기
   */
  async closeModal(): Promise<void> {
    const modal = this.page.locator('[data-testid="menu-selection-modal"]');
    const closeButton = modal.locator('[data-testid="modal-close-button"]');
    await closeButton.click();
  }

  /**
   * 모달: Escape 키로 모달 닫기
   */
  async closeModalWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  /**
   * 모달: 모달 내용 확인 (메뉴 이름이 포함된 질문)
   */
  async expectModalContent(): Promise<void> {
    await expect(this.page.getByText(/에 대해 어떤 방식으로 탐색할까요?/)).toBeVisible();
  }

  /**
   * 모달: 모달 액션 버튼 확인
   */
  async expectModalActionButtons(): Promise<void> {
    await expect(this.generalSearchButton).toBeVisible();
    await expect(this.aiRecommendationButton).toBeVisible();
  }

  /**
   * 모달: X 버튼 확인
   */
  async expectModalCloseButton(): Promise<void> {
    const modal = this.page.locator('[data-testid="menu-selection-modal"]');
    const closeButton = modal.locator('[data-testid="modal-close-button"]');
    await expect(closeButton).toBeVisible();
  }

  /**
   * 메뉴 카드: 특정 인덱스의 메뉴 카드가 하이라이트되었는지 확인
   */
  async expectMenuHighlighted(index: number): Promise<void> {
    const menuCard = this.page.getByRole('button').filter({ hasText: new RegExp(`^${index}`) }).first();
    await expect(menuCard).toHaveClass(/border-orange|bg-orange/);
  }

  /**
   * 메뉴 카드: 특정 인덱스의 메뉴 카드가 하이라이트되지 않았는지 확인
   */
  async expectMenuNotHighlighted(index: number): Promise<void> {
    const menuCard = this.page.getByRole('button').filter({ hasText: new RegExp(`^${index}`) }).first();
    await expect(menuCard).not.toHaveClass(/border-orange|bg-orange/);
  }

  /**
   * 메뉴 카드: 메뉴 이름 가져오기
   */
  async getMenuName(): Promise<string | null> {
    return await this.page.locator('[data-testid="selected-menu-name"]').textContent();
  }

  /**
   * 결과 확인: AI 추천 섹션 헤딩 확인
   */
  async expectAiRecommendationSectionVisible(): Promise<void> {
    await this.page.getByRole('heading', { name: 'AI 추천 식당', level: 2 })
      .waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
  }

  /**
   * 결과 확인: 일반 검색 섹션 헤딩 확인
   */
  async expectGeneralSearchSectionVisible(): Promise<void> {
    await this.page.getByRole('heading', { name: '주변 식당 검색 결과', level: 2 })
      .waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
  }

  /**
   * 탭: AI 추천 탭 클릭
   */
  async clickAiRecommendationTab(): Promise<void> {
    const aiTab = this.page.locator('[data-testid="results-tab-ai-recommendation"]');
    await aiTab.click();
  }

  /**
   * 탭: 일반 검색 탭 클릭
   */
  async clickGeneralSearchTab(): Promise<void> {
    const generalTab = this.page.getByRole('button').filter({ hasText: '일반 검색' }).first();
    await generalTab.click();
  }

  /**
   * 결과 확인: Mock AI 추천 이유 확인
   */
  async expectMockAiRecommendationReasonVisible(): Promise<void> {
    await expect(this.page.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantReason)).toBeVisible();
  }

  /**
   * 결과 확인: Mock 검색 주소 확인
   */
  async expectMockSearchAddressVisible(): Promise<void> {
    const searchResultsSection = this.page.locator('main').getByText(new RegExp(EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantAddress));
    await expect(searchResultsSection.first()).toBeVisible();
  }

  /**
   * 결과 확인: Mock 검색 식당 이름 헤딩 확인
   */
  async expectMockSearchRestaurantHeading(): Promise<void> {
    await expect(this.page.getByRole('heading', {
      name: EXPECTED_MOCK_RESPONSES.NAVER_SEARCH.firstRestaurantName,
      level: 4
    })).toBeVisible();
  }
}
