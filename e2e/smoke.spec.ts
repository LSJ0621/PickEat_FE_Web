import { test, expect } from '@playwright/test';
import { ROUTES, SELECTORS } from './fixtures/test-data';

/**
 * Smoke Test
 * E2E 테스트 환경이 올바르게 설정되었는지 검증
 */
test.describe('Smoke Test', () => {
  test('홈페이지 로드', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    // 페이지가 정상적으로 로드되었는지 확인
    await expect(page).toHaveURL(ROUTES.HOME);
    await expect(page).toHaveTitle('pickeat_web');
  });

  test('로그인 페이지 로드', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 로그인 폼 요소 확인
    await expect(page.locator(SELECTORS.login.email)).toBeVisible();
    await expect(page.locator(SELECTORS.login.password)).toBeVisible();
    await expect(page.locator(SELECTORS.login.submitButton)).toBeVisible();
  });

  test('회원가입 페이지 로드', async ({ page }) => {
    await page.goto(ROUTES.REGISTER);
    await expect(page).toHaveURL(ROUTES.REGISTER);

    // 회원가입 폼 요소 확인
    await expect(page.locator(SELECTORS.register.name)).toBeVisible();
    await expect(page.locator(SELECTORS.register.email)).toBeVisible();
  });

  test('보호된 페이지 접근 시 로그인으로 리다이렉트', async ({ page }) => {
    // 미인증 상태에서 보호된 페이지 접근
    await page.goto(ROUTES.AGENT);
    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });
});
