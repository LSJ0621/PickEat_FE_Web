// spec: e2e-test-plan/map-page-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES } from '../../fixtures/test-data';

test.describe('Map Page - Core Rendering and Navigation', () => {
  test('should redirect unauthenticated users to login page', async ({ page }) => {
    // 1. Navigate directly to /map without authentication
    await page.goto(ROUTES.MAP);

    // 2. Verify page redirects to /login
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 3. Verify login page displays email and password fields
    await expect(page.getByRole('textbox', { name: '이메일' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '비밀번호' })).toBeVisible();
  });

  test('should display map header with back button and title', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /map page
    await page.goto(ROUTES.MAP);

    // 2. Wait for page to load
    await page.getByText('네이버 지도').waitFor({ state: 'visible' });

    // 3. Verify header contains '← 뒤로가기' button
    await expect(page.getByRole('button', { name: '← 뒤로가기' })).toBeVisible();

    // 4. Verify header displays '네이버 지도' title
    await expect(page.getByText('네이버 지도')).toBeVisible();

    // 5. Verify user address is displayed in header (test user has registered address)
    await expect(page.getByRole('paragraph').filter({ hasText: '📍 서울특별시 강남구 테헤란로 123' })).toBeVisible();
  });

  test('should display loading state while Naver Maps SDK loads', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /map page
    await page.goto(ROUTES.MAP);

    // 2. Verify loading text is displayed
    await expect(page.getByText('지도를 불러오는 중...')).toBeVisible();

    // 3. Verify page header shows '네이버 지도' title
    await expect(page.getByText('네이버 지도')).toBeVisible();

    // 4. Verify back button is visible during loading
    await expect(page.getByRole('button', { name: '← 뒤로가기' })).toBeVisible();
  });

  test('should navigate back when clicking back button', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /map page
    await page.goto(ROUTES.MAP);

    // 2. Wait for page to fully load
    await page.getByText('네이버 지도').waitFor({ state: 'visible' });

    // 3. Click '← 뒤로가기' button in header
    await page.getByRole('button', { name: '← 뒤로가기' }).click();

    // 4. Verify navigation to previous page (home page since no history)
    await expect(page).toHaveURL(ROUTES.HOME);
  });
});
