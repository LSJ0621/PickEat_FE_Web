import { test as base, Page } from '@playwright/test';
import { TEST_ACCOUNTS, ROUTES, SELECTORS, TIMEOUTS } from './test-data';

/**
 * 인증 관련 Fixture 타입 정의
 */
type AuthFixtures = {
  /** 일반 사용자로 로그인된 페이지 */
  authenticatedPage: Page;
  /** 관리자로 로그인된 페이지 */
  adminPage: Page;
};

/**
 * 로그인 수행 헬퍼 함수
 */
async function performLogin(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto(ROUTES.LOGIN);
  await page.fill(SELECTORS.login.email, email);
  await page.fill(SELECTORS.login.password, password);
  await page.click(SELECTORS.login.submitButton);
  await page.waitForURL(ROUTES.HOME, { timeout: TIMEOUTS.MEDIUM });
}

/**
 * 인증 Fixture 확장
 */
export const test = base.extend<AuthFixtures>({
  /**
   * 일반 사용자로 로그인된 페이지
   * 테스트에서 authenticatedPage를 사용하면 자동으로 로그인됨
   */
  authenticatedPage: async ({ page }, use) => {
    await performLogin(
      page,
      TEST_ACCOUNTS.USER.email,
      TEST_ACCOUNTS.USER.password
    );
    await use(page);
  },

  /**
   * 관리자로 로그인된 페이지
   * 테스트에서 adminPage를 사용하면 자동으로 관리자로 로그인됨
   */
  adminPage: async ({ page }, use) => {
    await performLogin(
      page,
      TEST_ACCOUNTS.ADMIN.email,
      TEST_ACCOUNTS.ADMIN.password
    );
    await use(page);
  },
});

// expect 재export
export { expect } from '@playwright/test';
