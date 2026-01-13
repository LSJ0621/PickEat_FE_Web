// spec: e2e-test-plan/mypage-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES, TEST_ACCOUNTS } from '../../fixtures/test-data';

test.describe('User Information Display', () => {
  test('Display user name and email', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Verify page title shows '마이페이지'
    await expect(page.getByRole('heading', { name: '마이페이지' })).toBeVisible();

    // 3. Verify user name section is visible with label '이름'
    await expect(page.getByText('이름', { exact: true })).toBeVisible();

    // 4. Verify user name value is displayed (exact match to avoid '테스트유저님')
    await expect(page.getByText(TEST_ACCOUNTS.USER.name, { exact: true })).toBeVisible();

    // 5. Verify user email section is visible with label '이메일'
    await expect(page.getByText('이메일', { exact: true })).toBeVisible();

    // 6. Verify email value matches test@example.com
    await expect(page.getByText(TEST_ACCOUNTS.USER.email)).toBeVisible();
  });

  test('Display menu selection history link', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Locate the '메뉴 선택 이력' card
    await expect(page.getByText('메뉴 선택 이력')).toBeVisible();

    // 3. Verify card contains descriptive text
    await expect(page.getByText('선택한 메뉴들을 확인하고 관리할 수 있습니다.')).toBeVisible();

    // 4. Verify '이력 보기' button is visible
    const historyButton = page.getByRole('button', { name: '이력 보기' });
    await expect(historyButton).toBeVisible();

    // 5. Click '이력 보기' button
    await historyButton.click();

    // 6. Verify navigation to /menu-selections/history
    await expect(page).toHaveURL(ROUTES.MENU_SELECTIONS_HISTORY);
  });
});
