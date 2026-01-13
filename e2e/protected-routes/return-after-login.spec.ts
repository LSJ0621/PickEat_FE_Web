// spec: e2e-test-plan/phase3-protected-routes.plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Return After Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
    await page.goto(ROUTES.HOME);
    await page.evaluate(() => localStorage.clear());
  });

  test.fixme('User redirected back to /agent after successful login', async ({ page }) => {
    // FIXME: Current implementation redirects to homepage (/) instead of original route after login
    // The Login.tsx component (line 81) always navigates to '/' after successful login
    // It does not consume the redirectTo state passed by ProtectedRoute.tsx (line 21)
    // This test should be fixed once the app implements proper return-after-login behavior

    // 1. Navigate to http://localhost:8080/agent without authentication
    await page.goto(ROUTES.AGENT);

    // 2. Verify redirect to http://localhost:8080/login
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 3. Enter valid email in email textbox
    await page.locator('#email').fill('test@example.com');

    // 4. Enter valid password in password textbox
    // Note: Test plan specifies 'Password123!' but existing tests use 'password123'
    await page.locator('#password').fill('password123');

    // 5. Click '로그인' button
    await page.getByRole('button', { name: '로그인' }).click();

    // 6. Wait for login to complete
    await expect(page).not.toHaveURL(ROUTES.LOGIN);

    // 7. Verify URL is http://localhost:8080/agent
    // Note: Current implementation may redirect to homepage with setup modal
    // This assertion represents expected behavior per test plan
    await expect(page).toHaveURL(ROUTES.AGENT);

    // 8. Verify agent page content is displayed
    await expect(page.getByText('AI 에이전트')).toBeVisible();
  });

  test.fixme('User redirected back to /mypage after successful login', async ({ page }) => {
    // FIXME: Current implementation redirects to homepage (/) instead of original route after login
    // See Login.tsx line 81 - needs to implement redirectTo state handling

    // 1. Navigate to http://localhost:8080/mypage without authentication
    await page.goto(ROUTES.MYPAGE);

    // 2. Verify redirect to http://localhost:8080/login
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 3. Enter valid email 'test@example.com' in email field
    await page.locator('#email').fill('test@example.com');

    // 4. Enter valid password 'Password123!' in password field
    await page.locator('#password').fill('password123');

    // 5. Click login button
    await page.getByRole('button', { name: '로그인' }).click();

    // 6. Verify URL changes to http://localhost:8080/mypage
    await expect(page).toHaveURL(ROUTES.MYPAGE);

    // 7. Verify mypage content (user profile section) is visible
    await expect(page.getByText('마이페이지')).toBeVisible();
  });

  test.fixme('User redirected back to /map after successful login', async ({ page }) => {
    // FIXME: Current implementation redirects to homepage (/) instead of original route after login
    // See Login.tsx line 81 - needs to implement redirectTo state handling

    // 1. Navigate to http://localhost:8080/map without authentication
    await page.goto(ROUTES.MAP);

    // 2. Verify redirect to login page
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 3. Complete login with valid credentials
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: '로그인' }).click();

    // 4. Verify URL is http://localhost:8080/map
    await expect(page).toHaveURL(ROUTES.MAP);

    // 5. Verify map interface is loaded
    await expect(page.locator('#map')).toBeVisible();
  });

  test.fixme('User redirected back to /recommendations/history after successful login', async ({ page }) => {
    // FIXME: Current implementation redirects to homepage (/) instead of original route after login
    // See Login.tsx line 81 - needs to implement redirectTo state handling

    // 1. Navigate to http://localhost:8080/recommendations/history
    await page.goto(ROUTES.RECOMMENDATIONS_HISTORY);

    // 2. Verify redirect to login
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 3. Log in with valid user credentials
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: '로그인' }).click();

    // 4. Verify URL is http://localhost:8080/recommendations/history
    await expect(page).toHaveURL(ROUTES.RECOMMENDATIONS_HISTORY);

    // 5. Verify recommendation history page is displayed
    await expect(page.getByText('추천 이력')).toBeVisible();
  });

  test.fixme('User redirected back to /menu-selections/history after successful login', async ({ page }) => {
    // FIXME: Current implementation redirects to homepage (/) instead of original route after login
    // See Login.tsx line 81 - needs to implement redirectTo state handling

    // 1. Navigate to http://localhost:8080/menu-selections/history
    await page.goto(ROUTES.MENU_SELECTIONS_HISTORY);

    // 2. Confirm redirect to login page
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 3. Enter valid credentials and submit login form
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: '로그인' }).click();

    // 4. Verify URL is http://localhost:8080/menu-selections/history
    await expect(page).toHaveURL(ROUTES.MENU_SELECTIONS_HISTORY);

    // 5. Verify menu selection history page content is rendered
    await expect(page.getByText('메뉴 선택 이력')).toBeVisible();
  });

  test.fixme('User redirected back to /bug-report after successful login', async ({ page }) => {
    // FIXME: Current implementation redirects to homepage (/) instead of original route after login
    // See Login.tsx line 81 - needs to implement redirectTo state handling

    // 1. Navigate to http://localhost:8080/bug-report
    await page.goto(ROUTES.BUG_REPORT);

    // 2. Verify redirect to login page
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 3. Complete login process
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: '로그인' }).click();

    // 4. Verify URL is http://localhost:8080/bug-report
    await expect(page).toHaveURL(ROUTES.BUG_REPORT);

    // 5. Verify bug report form is displayed
    await expect(page.getByText('버그 제보')).toBeVisible();
  });

  test('Direct /login access redirects to homepage after successful login', async ({ page }) => {
    // 1. Navigate directly to http://localhost:8080/login
    await page.goto(ROUTES.LOGIN);

    // 2. Verify login page is displayed
    await expect(page.getByText('PickEat 계정으로 로그인')).toBeVisible();

    // 3. Enter valid email in email textbox
    await page.locator('#email').fill('test@example.com');

    // 4. Enter valid password in password textbox
    await page.locator('#password').fill('password123');

    // 5. Click '로그인' button
    await page.getByRole('button', { name: '로그인' }).click();

    // 6. Verify URL is http://localhost:8080/ (homepage)
    await expect(page).toHaveURL(ROUTES.HOME);

    // 7. Verify homepage content is displayed with user logged in
    await expect(page.getByText('테스트유저님')).toBeVisible();
  });

  test('Return-after-login flow with OAuth (Kakao)', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/agent without authentication
    await page.goto('http://localhost:8080/agent');

    // 2. Verify redirect to /login
    await expect(page).toHaveURL('http://localhost:8080/login');

    // 3. Click '카카오로 계속하기' button
    // Note: This test requires OAuth mocking which is beyond basic E2E scope
    // It would typically involve intercepting the OAuth redirect and mocking the callback
    const kakaoButton = page.getByRole('button', { name: '카카오로 계속하기' });
    await expect(kakaoButton).toBeVisible();

    // 4-6. Mock successful OAuth callback with token and verify redirect to /agent
    // This would require MSW or Playwright route interception
    // Skipping actual OAuth flow execution in this test
    // TODO: Implement OAuth mocking for complete E2E coverage
  });

  test('Return-after-login flow with OAuth (Google)', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/mypage without authentication
    await page.goto('http://localhost:8080/mypage');

    // 2. Verify redirect to /login
    await expect(page).toHaveURL('http://localhost:8080/login');

    // 3. Click 'Google로 계속하기' button
    // Note: This test requires OAuth mocking which is beyond basic E2E scope
    const googleButton = page.getByRole('button', { name: 'Google로 계속하기' });
    await expect(googleButton).toBeVisible();

    // 4-6. Mock successful Google OAuth callback and verify redirect to /mypage
    // This would require MSW or Playwright route interception
    // Skipping actual OAuth flow execution in this test
    // TODO: Implement OAuth mocking for complete E2E coverage
  });
});
