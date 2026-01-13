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
}
