// spec: e2e-test-plan/phase-09-admin.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/auth.fixture';
import { ROUTES } from '../fixtures/test-data';

test.describe('Admin Bug Reports Management', () => {
  test('Admin can access bug reports page', async ({ adminPage: page }) => {
    // 1. Navigate to /admin/bug-reports with admin credentials
    await page.goto(ROUTES.ADMIN_BUG_REPORTS);

    // 2. Verify page heading '문의사항 관리' is visible
    await expect(page.getByRole('heading', { name: '문의사항 관리' })).toBeVisible();

    // 3. Verify page description is visible
    await expect(page.getByText('버그 제보 및 문의사항을 확인하고 관리하세요.')).toBeVisible();

    // 4. Verify status filter combobox is visible
    await expect(page.getByRole('combobox').first()).toBeVisible();

    // 5. Verify reset button is visible
    await expect(page.getByRole('button', { name: '초기화' })).toBeVisible();
  });

  test('Admin can view bug report details', async ({ adminPage: page }) => {
    // 1. Navigate to /admin/bug-reports
    await page.goto(ROUTES.ADMIN_BUG_REPORTS);

    // 2. Wait for page to load
    await page.getByRole('heading', { name: '문의사항 관리' }).waitFor({ state: 'visible' });

    // 3. Click on a bug report to view details (using partial match for dynamic date)
    const bugReportButton = page.getByRole('button').filter({ hasText: '테스트 버그 리포트' }).first();
    await bugReportButton.click();

    // 4. Verify bug report title in modal is visible
    await expect(page.getByRole('heading', { name: '테스트 버그 리포트' }).nth(1)).toBeVisible();

    // 5. Verify details heading in modal is visible
    await expect(page.getByRole('heading', { name: '상세 내용' })).toBeVisible();

    // 6. Verify confirm button is visible in modal
    await expect(page.getByRole('button', { name: '확인 처리' })).toBeVisible();

    // 7. Close the modal
    await page.getByRole('button', { name: '닫기' }).last().click();

    // 8. Verify modal is closed
    await expect(page.getByRole('heading', { name: '상세 내용' })).not.toBeVisible();
  });

  test('Regular user is denied access to admin page', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /admin/bug-reports as regular user
    await page.goto(ROUTES.ADMIN_BUG_REPORTS);

    // 2. Wait for redirect to complete
    await page.waitForURL(ROUTES.HOME, { timeout: 5000 });

    // 3. Verify redirected to home page
    await expect(page).toHaveURL(ROUTES.HOME);

    // 4. Verify access denied error message appears
    await expect(page.getByText('접근 권한이 없습니다.').first()).toBeVisible({ timeout: 3000 });
  });

  test('Unauthenticated user is redirected to login', async ({ page }) => {
    // 1. Clear authentication tokens from localStorage
    await page.context().clearCookies();
    await page.goto(ROUTES.HOME);
    await page.evaluate(() => localStorage.clear());

    // 2. Navigate to /admin/bug-reports directly
    await page.goto(ROUTES.ADMIN_BUG_REPORTS);

    // 3. Verify immediate redirect to /login page
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 4. Verify login form is displayed
    await expect(page.getByRole('heading', { name: 'PickEat' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '이메일' })).toBeVisible();
  });
});
