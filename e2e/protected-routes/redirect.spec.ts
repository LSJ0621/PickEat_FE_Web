import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Protected Routes - Redirect Tests', () => {
  test('Unauthenticated user redirected to login from /agent', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/agent without authentication
    await page.goto(ROUTES.AGENT);

    // 2. Verify URL redirects to http://localhost:8080/login
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 3. Verify login page is displayed with email and password fields
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('Unauthenticated user redirected to login from /map', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/map without authentication
    await page.goto(ROUTES.MAP);

    // 2. Verify URL redirects to http://localhost:8080/login
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 3. Verify login page is displayed
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });

  test('Unauthenticated user redirected to login from /mypage', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/mypage without authentication
    await page.goto(ROUTES.MYPAGE);

    // 2. Verify URL redirects to http://localhost:8080/login
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 3. Check that 'PickEat 계정으로 로그인' text is visible
    await expect(page.getByText('PickEat 계정으로 로그인')).toBeVisible();
  });

  test('Unauthenticated user redirected to login from /recommendations/history', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/recommendations/history without authentication
    await page.goto(ROUTES.RECOMMENDATIONS_HISTORY);

    // 2. Verify URL redirects to http://localhost:8080/login
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // Social login buttons (Google, Kakao) should be visible
    await expect(page.getByRole('button', { name: 'Google로 계속하기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '카카오로 계속하기' })).toBeVisible();
  });

  test('Unauthenticated user redirected to login from /menu-selections/history', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/menu-selections/history without authentication
    await page.goto(ROUTES.MENU_SELECTIONS_HISTORY);

    // 2. Verify URL redirects to http://localhost:8080/login and login page is fully rendered
    await expect(page).toHaveURL(ROUTES.LOGIN);
    await expect(page.getByRole('heading', { name: 'PickEat' })).toBeVisible();
  });

  test('Unauthenticated user redirected to login from /bug-report', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/bug-report without authentication
    await page.goto(ROUTES.BUG_REPORT);

    // 2. Verify URL redirects to http://localhost:8080/login
    await expect(page).toHaveURL(ROUTES.LOGIN);
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });

  test('Unauthenticated user redirected to login from /admin/bug-reports', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/admin/bug-reports without authentication
    await page.goto(ROUTES.ADMIN_BUG_REPORTS);

    // 2. Verify URL redirects to http://localhost:8080/login and no admin panel is visible
    await expect(page).toHaveURL(ROUTES.LOGIN);
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });

  test('Footer navigation shows auth prompt modal when not logged in', async ({ page }) => {
    // 1. Navigate to http://localhost:8080/ (homepage)
    await page.goto(ROUTES.HOME);

    // 2. Wait for page to fully load
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });

    // 3. Click on '에이전트' button in the footer navigation
    await page.getByRole('button', { name: '에이전트', exact: true }).click();

    // 4. Verify auth prompt modal appears with text '로그인이 필요한 서비스입니다'
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();

    // 5. Verify modal has '로그인하러 가기' and '닫기' buttons
    await expect(page.getByRole('button', { name: '로그인하러 가기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '닫기' })).toBeVisible();

    // 6. Click '닫기' button
    await page.getByRole('button', { name: '닫기' }).click();

    // 7. Verify modal disappears and user stays on homepage
    await expect(page.getByText('오늘 뭐 먹지?')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });
});
