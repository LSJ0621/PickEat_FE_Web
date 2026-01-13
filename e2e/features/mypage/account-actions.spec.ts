// spec: e2e-test-plan/mypage-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { test as baseTest } from '@playwright/test';
import {
  ROUTES,
  TIMEOUTS,
  TEST_ACCOUNTS,
  SELECTORS,
  TEST_VERIFICATION,
} from '../../fixtures/test-data';
import { generateTestEmail } from '../../fixtures/test-helpers';

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
    await expect(page.getByRole('heading', { name: '회원 탈퇴', level: 2 })).toBeVisible();

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
    await expect(page.getByRole('heading', { name: '회원 탈퇴', level: 2 })).toBeVisible();

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
    await expect(page.getByRole('heading', { name: '회원 탈퇴', level: 2 })).toBeVisible();

    // 4. Find and click X close button in the modal (ModalCloseButton has data-testid)
    const closeButton = page.getByTestId('modal-close-button');
    await closeButton.click();

    // 5. Verify modal is closed
    await expect(page.getByText('정말 회원 탈퇴를 하시겠습니까?')).not.toBeVisible();

    // 6. Verify user is still on mypage
    await expect(page.getByRole('heading', { name: '마이페이지' })).toBeVisible();
    await expect(page).toHaveURL(ROUTES.MYPAGE);
  });
});

// Tests for account deletion execution (uses unique test accounts)
baseTest.describe('MyPage Account Deletion Execution', () => {
  baseTest('Execute account deletion and verify redirect to login', async ({ page }) => {
    // Setup: Create a unique test account for deletion
    const testEmail = generateTestEmail();
    const testPassword = 'password123';
    const testName = '탈퇴테스트유저';

    // 1. Register a new account
    await page.goto(ROUTES.REGISTER);
    await page.getByRole('heading', { name: '회원가입' }).waitFor({ state: 'visible' });

    await page.locator('#name').fill(testName);
    await page.locator('#email').fill(testEmail);
    await page.getByRole('button', { name: '중복 확인' }).click();
    await page.getByText('사용 가능한 이메일입니다').waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });

    await page.getByRole('button', { name: '인증번호 발송' }).click();
    const codeInput = page.getByRole('textbox', { name: '6자리 인증번호 입력' });
    await codeInput.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    await codeInput.fill(TEST_VERIFICATION.CODE);
    await page.getByRole('button', { name: '확인' }).click();
    await page.getByText('이메일 인증이 완료되었습니다').waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });

    await page.locator('#password').fill(testPassword);
    await page.locator('#confirmPassword').fill(testPassword);
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(ROUTES.LOGIN, { timeout: TIMEOUTS.MEDIUM });

    // 2. Login with the new account
    await page.fill(SELECTORS.login.email, testEmail);
    await page.fill(SELECTORS.login.password, testPassword);
    await page.click(SELECTORS.login.submitButton);
    await page.waitForURL(ROUTES.HOME, { timeout: TIMEOUTS.MEDIUM });

    // 3. Navigate to MyPage
    await page.goto(ROUTES.MYPAGE);
    await page.getByRole('heading', { name: '마이페이지' }).waitFor({ state: 'visible' });

    // 4. Click account deletion button
    const deleteAccountButton = page.getByRole('button', { name: '회원 탈퇴' });
    await deleteAccountButton.click();

    // 5. Verify confirmation modal appears
    await page.getByRole('heading', { name: '회원 탈퇴', level: 2 }).waitFor({ state: 'visible' });
    await page.getByText('정말 회원 탈퇴를 하시겠습니까?').waitFor({ state: 'visible' });

    // 6. Click confirm deletion button
    const confirmDeleteButton = page.getByRole('button', { name: '탈퇴하기' });
    await confirmDeleteButton.click();

    // 7. Verify redirect to login page after deletion
    await page.waitForURL(ROUTES.LOGIN, { timeout: TIMEOUTS.MEDIUM });

    // 8. Verify tokens are removed from localStorage
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });

  baseTest('Attempt to login with deleted account shows error', async ({ page }) => {
    // This test uses the TEST_ACCOUNTS.DELETED_USER which is pre-configured in backend test mode
    const deletedEmail = TEST_ACCOUNTS.DELETED_USER.email;

    // 1. Navigate to login page
    await page.goto(ROUTES.LOGIN);
    await page.getByRole('heading', { name: '로그인' }).waitFor({ state: 'visible' });

    // 2. Fill in deleted account credentials
    await page.fill(SELECTORS.login.email, deletedEmail);
    await page.fill(SELECTORS.login.password, 'anypassword');

    // 3. Click login button
    await page.click(SELECTORS.login.submitButton);

    // 4. Wait for and verify error message appears
    const errorMessage = page.getByText('로그인에 실패했습니다').or(
      page.getByText('탈퇴한 계정입니다')
    ).or(
      page.getByText('이메일 또는 비밀번호가 올바르지 않습니다')
    );
    await errorMessage.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });

    // 5. Verify user is not logged in
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeNull();
  });
});
