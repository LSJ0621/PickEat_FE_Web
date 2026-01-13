import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../test-data';

/**
 * 지도 페이지 Page Object
 */
export class MapPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 지도 페이지로 이동
   */
  async goto(): Promise<void> {
    await this.page.goto(ROUTES.MAP);
  }

  /**
   * 지도 로딩 완료 확인
   */
  async expectMapLoaded(): Promise<void> {
    const loadingText = this.page.getByText('지도를 불러오는 중...');
    const isVisible = await loadingText.isVisible().catch(() => false);
    if (isVisible) {
      await loadingText.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  /**
   * 헤더 표시 확인
   */
  async expectHeaderVisible(): Promise<void> {
    await expect(this.page.getByText('네이버 지도')).toBeVisible();
    await expect(this.page.getByRole('button', { name: '← 뒤로가기' })).toBeVisible();
  }

  /**
   * 뒤로가기 버튼 클릭
   */
  async goBack(): Promise<void> {
    await this.page.getByRole('button', { name: '← 뒤로가기' }).click();
  }

  /**
   * 홈 페이지로 이동 확인
   */
  async expectNavigatedToHome(): Promise<void> {
    await expect(this.page).toHaveURL(ROUTES.HOME);
  }

  /**
   * 로그인 페이지로 리다이렉트 확인
   */
  async expectRedirectToLogin(): Promise<void> {
    await expect(this.page).toHaveURL(ROUTES.LOGIN);
  }
}
