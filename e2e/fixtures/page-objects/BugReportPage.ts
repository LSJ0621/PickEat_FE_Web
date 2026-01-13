import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../test-data';

/**
 * 버그 제보 페이지 Page Object
 */
export class BugReportPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 버그 제보 페이지로 이동
   */
  async goto(): Promise<void> {
    await this.page.goto(ROUTES.BUG_REPORT);
    await this.page.getByRole('heading', { name: '버그 제보' }).waitFor({ state: 'visible' });
  }

  /**
   * 카테고리 선택
   */
  async selectCategory(category: string): Promise<void> {
    await this.page.getByRole('radio', { name: category }).click();
  }

  /**
   * 제목 입력
   */
  async fillTitle(title: string): Promise<void> {
    await this.page.locator('#title').fill(title);
  }

  /**
   * 상세 내용 입력
   */
  async fillDescription(description: string): Promise<void> {
    await this.page.locator('#description').fill(description);
  }

  /**
   * 제출 버튼 클릭
   */
  async submitReport(): Promise<void> {
    await this.page.getByRole('button', { name: '제출하기' }).click();
  }

  /**
   * 제출 성공 확인
   */
  async expectSubmitSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(ROUTES.HOME, { timeout: 10000 });
  }

  /**
   * 모든 폼 요소 표시 확인
   */
  async expectAllFormElementsVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: '버그 제보' })).toBeVisible();
    await expect(this.page.getByRole('radio', { name: '버그 제보' })).toBeVisible();
    await expect(this.page.getByRole('radio', { name: '문의 사항' })).toBeVisible();
    await expect(this.page.locator('#title')).toBeVisible();
    await expect(this.page.locator('#description')).toBeVisible();
    await expect(this.page.getByRole('button', { name: '제출하기' })).toBeVisible();
  }
}
