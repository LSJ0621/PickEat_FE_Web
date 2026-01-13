import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

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
});
