// spec: Re-Registration E2E Tests
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import {
  TEST_ACCOUNTS,
  TEST_VERIFICATION,
  ROUTES,
  TIMEOUTS,
} from '../fixtures/test-data';

test.describe('Re-Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/re-register');
    await page.getByText('재가입').first().waitFor({ state: 'visible' });
  });

  // 1. 페이지 접근 및 폼 요소 표시
  test('displays re-register form elements', async ({ page }) => {
    // Verify email input field is visible
    await expect(page.locator('#email')).toBeVisible();

    // Verify password fields are visible
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();

    // Verify name input field is visible
    await expect(page.locator('#name')).toBeVisible();

    // Verify re-register button is visible and disabled by default
    await expect(page.getByRole('button', { name: '재가입' })).toBeVisible();
    await expect(page.getByRole('button', { name: '재가입' })).toBeDisabled();

    // Verify back to login link is visible
    await expect(page.getByText('로그인으로 돌아가기')).toBeVisible();
  });

  // 2. 이메일 입력 후 인증번호 발송 버튼 확인 (재가입 모드는 중복 확인 없이 바로 인증번호 발송)
  test('shows send verification button for deleted account email', async ({ page }) => {
    // Fill deleted user email
    await page.locator('#email').fill(TEST_ACCOUNTS.DELETED_USER.email);

    // In RE_REGISTER mode, duplicate check is skipped - directly shows '인증번호 발송' button
    // Verify send code button is enabled
    await expect(page.getByRole('button', { name: '인증번호 발송' })).toBeEnabled();
  });

  // 3. 인증 코드 발송 및 검증
  test('sends and verifies email code', async ({ page }) => {
    // Fill deleted user email
    await page.locator('#email').fill(TEST_ACCOUNTS.DELETED_USER.email);

    // In RE_REGISTER mode, duplicate check is skipped - directly send verification code
    await page.getByRole('button', { name: '인증번호 발송' }).click();

    // Wait for success message first, then check input is enabled
    const codeInput = page.getByPlaceholder('6자리 인증번호 입력');
    await expect(page.getByText(/인증 코드를 발송했습니다|인증번호가 발송되었습니다/)).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await expect(codeInput).toBeEnabled();

    // Fill verification code
    await codeInput.fill(TEST_VERIFICATION.CODE);

    // Click verify button
    await page.getByRole('button', { name: '확인' }).click();

    // Verify email verification completed
    await expect(page.getByText('이메일 인증이 완료되었습니다')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  });

  // 4. 비밀번호 설정 유효성 검사
  test('validates password requirements', async ({ page }) => {
    // Test password too short
    await page.locator('#password').fill('pass');
    await page.locator('#confirmPassword').fill('pass');

    // Verify error message for short password
    await expect(page.getByText('비밀번호는 최소 6자 이상이어야 합니다.')).toBeVisible();

    // Test password mismatch
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('different456');

    // Verify mismatch error message
    await expect(page.getByText('비밀번호가 일치하지 않습니다.')).toBeVisible();

    // Test valid matching passwords
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password123');

    // Verify no error messages for valid passwords
    await expect(page.getByText('비밀번호는 최소 6자 이상이어야 합니다.')).not.toBeVisible();
    await expect(page.getByText('비밀번호가 일치하지 않습니다.')).not.toBeVisible();
  });

  // 5. 재가입 완료 → 로그인 페이지 리다이렉트
  test('completes re-registration and redirects to login', async ({ page }) => {
    // Fill email
    await page.locator('#email').fill(TEST_ACCOUNTS.DELETED_USER.email);

    // In RE_REGISTER mode, duplicate check is skipped - directly send verification code
    await page.getByRole('button', { name: '인증번호 발송' }).click();
    const codeInput = page.getByPlaceholder('6자리 인증번호 입력');
    await expect(page.getByText(/인증 코드를 발송했습니다|인증번호가 발송되었습니다/)).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await expect(codeInput).toBeEnabled();
    await codeInput.fill(TEST_VERIFICATION.CODE);
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByText('이메일 인증이 완료되었습니다')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

    // Fill passwords
    await page.locator('#password').fill('newpassword123');
    await page.locator('#confirmPassword').fill('newpassword123');

    // Fill name
    await page.locator('#name').fill('재가입유저');

    // Submit re-registration
    const submitButton = page.getByRole('button', { name: '재가입' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verify redirect to login page
    await expect(page).toHaveURL(ROUTES.LOGIN, { timeout: TIMEOUTS.MEDIUM });
  });

  // 6. 이메일 인증 없이 재가입 시도
  test('cannot submit without email verification', async ({ page }) => {
    // Fill all fields without email verification
    await page.locator('#email').fill(TEST_ACCOUNTS.DELETED_USER.email);
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password123');
    await page.locator('#name').fill('테스트유저');

    // Verify submit button is disabled
    await expect(page.getByRole('button', { name: '재가입' })).toBeDisabled();
  });

  // 7. 잘못된 인증 코드 입력
  test('shows error for invalid verification code', async ({ page }) => {
    // Fill email
    await page.locator('#email').fill(TEST_ACCOUNTS.DELETED_USER.email);

    // In RE_REGISTER mode, duplicate check is skipped - directly send verification code
    await page.getByRole('button', { name: '인증번호 발송' }).click();

    // Enter invalid code - wait for success message first
    const codeInput = page.getByPlaceholder('6자리 인증번호 입력');
    await expect(page.getByText(/인증 코드를 발송했습니다|인증번호가 발송되었습니다/)).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await expect(codeInput).toBeEnabled();
    await codeInput.fill(TEST_VERIFICATION.INVALID_CODE);

    // Click verify button
    await page.getByRole('button', { name: '확인' }).click();

    // Verify error message appears
    await expect(
      page.getByText('코드가 유효하지 않습니다').or(page.getByText('인증번호가 일치하지 않습니다'))
    ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  });

  // 8. 로그인 페이지로 돌아가기
  test('navigates back to login page', async ({ page }) => {
    // Click back to login link
    await page.getByText('로그인으로 돌아가기').click();

    // Verify navigation to login page
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });
});
