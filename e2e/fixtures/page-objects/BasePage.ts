import { Page, expect } from '@playwright/test';
import { SELECTORS, TIMEOUTS } from '../test-data';

/**
 * 기본 Page Object 클래스
 * 모든 페이지에서 공통으로 사용하는 기능 제공
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 로딩 완료 대기
   */
  async waitForLoadingComplete(timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    const spinner = this.page.locator(SELECTORS.common.loadingSpinner);
    const isVisible = await spinner.isVisible().catch(() => false);
    if (isVisible) {
      await spinner.waitFor({ state: 'hidden', timeout });
    }
  }

  /**
   * Toast 메시지 확인
   */
  async expectToast(message: string): Promise<void> {
    await expect(this.page.locator(SELECTORS.common.toast)).toContainText(message);
  }

  /**
   * 다이얼로그 대기
   */
  async waitForDialog(): Promise<void> {
    await this.page.waitForSelector(SELECTORS.common.dialog);
  }

  /**
   * 다이얼로그 닫기
   */
  async closeDialog(): Promise<void> {
    await this.page.click(SELECTORS.common.dialogCloseButton);
    await this.page.waitForSelector(SELECTORS.common.dialog, { state: 'hidden' });
  }

  /**
   * localStorage에서 값 가져오기
   */
  async getLocalStorageItem(key: string): Promise<string | null> {
    return this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  /**
   * localStorage에 값 설정
   */
  async setLocalStorageItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value });
  }

  /**
   * localStorage 전체 삭제
   */
  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * 토큰 가져오기
   */
  async getToken(): Promise<string | null> {
    return this.getLocalStorageItem('token');
  }

  /**
   * 토큰 존재 확인
   */
  async expectTokenExists(): Promise<void> {
    const token = await this.getToken();
    expect(token).toBeTruthy();
  }

  /**
   * 토큰 없음 확인
   */
  async expectTokenNotExists(): Promise<void> {
    const token = await this.getToken();
    expect(token).toBeNull();
  }

  /**
   * 현재 URL 확인
   */
  async expectUrl(url: string): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }

  /**
   * URL 패턴 확인
   */
  async expectUrlPattern(pattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  /**
   * 요소 표시 확인
   */
  async expectVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * 요소 숨김 확인
   */
  async expectHidden(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  /**
   * 텍스트 포함 확인
   */
  async expectText(text: string): Promise<void> {
    await expect(this.page.locator(`text=${text}`)).toBeVisible();
  }

  /**
   * 버튼 활성화 확인
   */
  async expectButtonEnabled(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeEnabled();
  }

  /**
   * 버튼 비활성화 확인
   */
  async expectButtonDisabled(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeDisabled();
  }

  /**
   * API 응답 대기
   */
  async waitForApiResponse(
    urlPattern: string | RegExp,
    timeout: number = TIMEOUTS.MEDIUM
  ): Promise<void> {
    await this.page.waitForResponse(
      (response) => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }
}
