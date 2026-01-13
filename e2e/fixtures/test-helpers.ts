import { Page, expect } from '@playwright/test';
import { SELECTORS, TIMEOUTS } from './test-data';

/**
 * test-helpers.ts
 * BasePage를 사용하지 않는 케이스(직접 page 객체 사용)를 위한 유틸리티 함수
 *
 * 중복 제거된 함수들:
 * - getToken, clearLocalStorage, expectTokenExists, expectTokenNotExists
 * - expectUrl, expectUrlPattern, waitForApiResponse, waitForLoadingComplete
 * - expectToast, closeDialog, expectButtonEnabled, expectButtonDisabled
 *
 * 위 함수들은 BasePage.ts에서 인스턴스 메서드로 제공됩니다.
 * Page Object 패턴을 사용하는 경우 BasePage를 상속받아 사용하세요.
 */

/**
 * localStorage에 토큰 설정
 */
export async function setToken(page: Page, token: string): Promise<void> {
  await page.evaluate((t) => localStorage.setItem('token', t), token);
}

/**
 * localStorage에서 토큰 삭제
 */
export async function clearToken(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.removeItem('token'));
}

/**
 * sessionStorage에서 값 가져오기
 */
export async function getSessionStorageItem(
  page: Page,
  key: string
): Promise<string | null> {
  return page.evaluate((k) => sessionStorage.getItem(k), key);
}

/**
 * sessionStorage에 값 설정
 */
export async function setSessionStorageItem(
  page: Page,
  key: string,
  value: string
): Promise<void> {
  await page.evaluate(({ k, v }) => sessionStorage.setItem(k, v), {
    k: key,
    v: value,
  });
}

/**
 * 에러 팝업 닫기
 */
export async function closeErrorPopup(page: Page): Promise<void> {
  const confirmButton = page.locator(SELECTORS.login.confirmButton);
  if (await confirmButton.isVisible()) {
    await confirmButton.click();
  }
}

/**
 * 새 탭 처리 (소셜 로그인 등)
 */
export async function waitForNewTab(
  page: Page,
  action: () => Promise<void>
): Promise<Page | null> {
  const context = page.context();
  const [newPage] = await Promise.all([
    context.waitForEvent('page').catch(() => null),
    action(),
  ]);
  return newPage;
}

/**
 * 쿨다운 타이머 대기
 */
export async function waitForCooldownEnd(
  page: Page,
  buttonSelector: string
): Promise<void> {
  const waitingButton = page.locator(buttonSelector);
  if (await waitingButton.isVisible()) {
    await waitingButton.waitFor({
      state: 'detached',
      timeout: TIMEOUTS.COOLDOWN,
    });
  }
}

/**
 * 고유한 테스트 이메일 생성
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * 폼 필드 에러 메시지 확인
 */
export async function expectFieldError(
  page: Page,
  errorMessage: string
): Promise<void> {
  await expect(page.locator(`text=${errorMessage}`)).toBeVisible();
}
