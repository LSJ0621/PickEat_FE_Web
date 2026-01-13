// spec: e2e-test-plan/mypage-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES } from '../../fixtures/test-data';

test.describe('MyPage Account Actions', () => {
  test('Logout successfully', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Verify page loaded
    await expect(page.getByRole('heading', { name: '마이페이지' })).toBeVisible();

    // 3. Find and click logout button at the bottom
    const logoutButton = page.getByRole('button', { name: '로그아웃' });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // 4. Verify redirect to /login
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // 5. Verify tokens are removed from localStorage
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });

  test('Open account deletion modal', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Find and click delete account button at top right
    const deleteAccountButton = page.getByRole('button', { name: '회원 탈퇴' });
    await expect(deleteAccountButton).toBeVisible();
    await deleteAccountButton.click();

    // 3. Verify confirmation modal is displayed
    const modalHeading = page.locator('h2', { hasText: '회원 탈퇴' });
    await expect(modalHeading).toBeVisible();

    // 4. Verify modal text is visible
    await expect(page.getByText('정말 회원 탈퇴를 하시겠습니까?')).toBeVisible();

    // 5. Verify '탈퇴하기' button is visible
    await expect(page.getByRole('button', { name: '탈퇴하기' })).toBeVisible();

    // 6. Verify '취소' button is visible
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
  });

  test('Cancel account deletion', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open delete account modal
    const deleteAccountButton = page.getByRole('button', { name: '회원 탈퇴' });
    await deleteAccountButton.click();

    // 3. Wait for modal to appear
    await expect(page.locator('h2', { hasText: '회원 탈퇴' })).toBeVisible();

    // 4. Click cancel button
    const cancelButton = page.getByRole('button', { name: '취소' });
    await cancelButton.click();

    // 5. Verify modal is closed (modal heading should not be visible)
    await expect(page.getByText('정말 회원 탈퇴를 하시겠습니까?')).not.toBeVisible();

    // 6. Verify user is still logged in
    await expect(page.getByRole('heading', { name: '마이페이지' })).toBeVisible();

    // 7. Verify URL is still /mypage
    await expect(page).toHaveURL(ROUTES.MYPAGE);
  });

  test('Close account deletion modal with X button', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open delete account modal
    const deleteAccountButton = page.getByRole('button', { name: '회원 탈퇴' });
    await deleteAccountButton.click();

    // 3. Wait for modal to appear
    await expect(page.locator('h2', { hasText: '회원 탈퇴' })).toBeVisible();

    // 4. Find and click X close button in the modal (the button has SVG with X path)
    const closeButton = page.locator('button').filter({
      has: page.locator('svg path[d="M6 18L18 6M6 6l12 12"]')
    });
    await closeButton.click();

    // 5. Verify modal is closed
    await expect(page.getByText('정말 회원 탈퇴를 하시겠습니까?')).not.toBeVisible();

    // 6. Verify user is still on mypage
    await expect(page.getByRole('heading', { name: '마이페이지' })).toBeVisible();
    await expect(page).toHaveURL(ROUTES.MYPAGE);
  });
});
