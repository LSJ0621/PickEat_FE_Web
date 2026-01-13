import { test, expect } from '@playwright/test';
import { ROUTES, TEST_ACCOUNTS, TEST_VERIFICATION } from '../fixtures/test-data';

test.describe('Phase 1: Auth Tests - Password Reset', () => {
  test('Password Reset Page UI Elements', async ({ page }) => {
    // Navigate to password reset page at /password/reset/request
    await page.goto(ROUTES.FORGOT_PASSWORD);

    // Verify page title '비밀번호 재설정' is visible
    await expect(page.getByRole('heading', { name: '비밀번호 재설정' })).toBeVisible();

    // Verify email input field exists with label '이메일'
    await expect(page.getByRole('textbox', { name: '이메일' })).toBeVisible();

    // Verify '인증번호 발송' button exists
    await expect(page.getByRole('button', { name: '인증번호 발송' })).toBeVisible();

    // Verify verification code input field exists (initially disabled) with placeholder '6자리 인증번호 입력'
    await expect(page.getByRole('textbox', { name: '인증번호' })).toBeVisible();

    // Verify '인증하기' button exists (initially disabled)
    await expect(page.getByRole('button', { name: '인증하기' })).toBeVisible();

    // Verify '로그인 화면으로 돌아가기' link/button exists
    await expect(page.getByRole('button', { name: '로그인 화면으로 돌아가기' })).toBeVisible();
  });

  test('Email Entry Enables Send Button', async ({ page }) => {
    // Navigate to password reset page
    await page.goto(ROUTES.FORGOT_PASSWORD);

    // Wait for loading state to disappear
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });

    // Enter email 'test@example.com' into email field
    await page.getByRole('textbox', { name: '이메일' }).fill('test@example.com');

    // Verify '인증번호 발송' button is visible and enabled
    await expect(page.getByRole('button', { name: '인증번호 발송' })).toBeVisible();
  });

  test('Empty Email Field State', async ({ page }) => {
    // Navigate to password reset page
    await page.goto(ROUTES.FORGOT_PASSWORD);

    // Wait for form to load
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });

    // Clear the email field by filling with empty string
    await page.getByRole('textbox', { name: '이메일' }).fill('');
  });

  test('Invalid Email Format Submission', async ({ page }) => {
    // Navigate to password reset page
    await page.goto(ROUTES.FORGOT_PASSWORD);

    // Wait for form to load
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });

    // Enter invalid email 'notanemail' into email field
    await page.getByRole('textbox', { name: '이메일' }).fill('notanemail');

    // Click '인증번호 발송' button
    await page.getByRole('button', { name: '인증번호 발송' }).click();

    // Verify error message is displayed
    await expect(page.getByText('등록되지 않은 이메일입니다.')).toBeVisible();
  });

  test('Navigation Back to Login', async ({ page }) => {
    // Navigate to password reset page
    await page.goto(ROUTES.FORGOT_PASSWORD);

    // Wait for form to load
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });

    // Click '로그인 화면으로 돌아가기' button/link
    await page.getByRole('button', { name: '로그인 화면으로 돌아가기' }).click();

    // Verify navigation to /login page
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });

  test('Verification Code Field Behavior', async ({ page }) => {
    // Navigate to password reset page
    await page.goto(ROUTES.FORGOT_PASSWORD);

    // Verify verification code field is visible
    await expect(page.getByRole('textbox', { name: '인증번호' })).toBeVisible();
  });

  test('Page Loading State', async ({ page }) => {
    // Navigate to password reset page
    await page.goto(ROUTES.FORGOT_PASSWORD);

    // Wait for loading to complete and form to be displayed
    await page.getByText("비밀번호 재설정").first().waitFor({ state: 'visible' });

    // Verify form is displayed after loading
    await expect(page.getByRole('heading', { name: '비밀번호 재설정' })).toBeVisible();
  });

  test('Complete Password Reset Flow - Send and Verify Code', async ({ page }) => {
    // Navigate to password reset request page
    await page.goto(ROUTES.FORGOT_PASSWORD);

    // Wait for form to be ready
    await page.getByRole('textbox', { name: '이메일' }).waitFor({ state: 'visible' });

    // Step 1: Enter valid test email
    await page.getByRole('textbox', { name: '이메일' }).fill(TEST_ACCOUNTS.USER.email);

    // Step 2: Click '인증번호 발송' button
    await page.getByRole('button', { name: '인증번호 발송' }).click();

    // Wait for success message indicating code was sent
    await expect(page.getByText(/인증번호가 발송되었습니다/)).toBeVisible({ timeout: 10000 });

    // Step 3: Enter verification code (123456 in E2E mock mode)
    await page.getByRole('textbox', { name: '인증번호' }).fill(TEST_VERIFICATION.CODE);

    // Step 4: Click '인증하기' button
    await page.getByRole('button', { name: '인증하기' }).click();

    // Step 5: Verify navigation to password reset page with email parameter
    await expect(page).toHaveURL(/\/password\/reset\?email=/, { timeout: 10000 });
  });

  test('New Password Page - UI Elements', async ({ page }) => {
    // Navigate to password reset page with email
    await page.goto(`${ROUTES.PASSWORD_RESET}?email=${encodeURIComponent(TEST_ACCOUNTS.USER.email)}`);

    // Verify page heading
    await expect(page.getByRole('heading', { name: '새 비밀번호 설정' })).toBeVisible();

    // Verify authenticated email display
    await expect(page.getByText('인증된 이메일')).toBeVisible();
    await expect(page.getByText(TEST_ACCOUNTS.USER.email)).toBeVisible();

    // Verify new password input field
    await expect(page.locator('#new-password')).toBeVisible();

    // Verify password confirmation input field
    await expect(page.locator('#confirm-password')).toBeVisible();

    // Verify submit button
    await expect(page.getByRole('button', { name: '비밀번호 변경' })).toBeVisible();

    // Verify link to go back to verification step
    await expect(page.getByRole('button', { name: '인증번호 다시 받기' })).toBeVisible();
  });

  test('New Password Page - Password Mismatch Validation', async ({ page }) => {
    // Navigate to password reset page with email
    await page.goto(`${ROUTES.PASSWORD_RESET}?email=${encodeURIComponent(TEST_ACCOUNTS.USER.email)}`);

    // Wait for page to load
    await expect(page.getByRole('heading', { name: '새 비밀번호 설정' })).toBeVisible();

    // Enter valid new password
    await page.locator('#new-password').fill('newpass123');

    // Enter different confirmation password
    await page.locator('#confirm-password').fill('different456');

    // Click submit button
    await page.getByRole('button', { name: '비밀번호 변경' }).click();

    // Verify error message for password mismatch
    await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible();
  });

  test('New Password Page - Missing Email Redirect', async ({ page }) => {
    // Navigate to password reset page without email parameter
    await page.goto(ROUTES.PASSWORD_RESET);

    // Wait for page to load
    await expect(page.getByRole('heading', { name: '새 비밀번호 설정' })).toBeVisible();

    // Enter valid passwords
    await page.locator('#new-password').fill('validpass123');
    await page.locator('#confirm-password').fill('validpass123');

    // Click submit button
    await page.getByRole('button', { name: '비밀번호 변경' }).click();

    // Verify error popup for missing email (increased timeout for popup rendering)
    await expect(page.getByText('이메일을 찾지 못했어요')).toBeVisible({ timeout: 5000 });
  });
});
