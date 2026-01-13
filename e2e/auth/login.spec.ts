import { test, expect } from '@playwright/test';
import { ROUTES, TEST_ACCOUNTS } from '../fixtures/test-data';

test.describe('Phase 1: Auth Tests - Login', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto(ROUTES.LOGIN);
  });

  test('Successful Login with Valid Credentials', async ({ page }) => {
    // 1. Enter email: test@example.com
    await page.locator('#email').fill(TEST_ACCOUNTS.USER.email);

    // 2. Enter password: password123
    await page.locator('#password').fill(TEST_ACCOUNTS.USER.password);

    // 3. Click login button
    await page.getByRole('button', { name: '로그인' }).click();

    // 4. Verify redirect to home page (/)
    await expect(page).toHaveURL(ROUTES.HOME, { timeout: 10000 });

    // 5. Verify tokens stored in localStorage
    const hasToken = await page.evaluate(() => {
      const token = localStorage.getItem('token');
      return !!token;
    });
    expect(hasToken).toBe(true);
  });

  test('Login with Invalid Credentials', async ({ page }) => {
    // 1. Enter invalid email
    await page.locator('#email').fill('invalid@example.com');

    // 2. Enter invalid password
    await page.locator('#password').fill('wrongpassword');

    // 3. Click login button
    await page.getByRole('button', { name: '로그인' }).click();

    // 4. Verify error modal appears with message
    await expect(page.getByText('로그인에 실패했습니다')).toBeVisible();
    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeVisible();
  });

  test('Login with Empty Fields', async ({ page }) => {
    // 1. Click login button with empty fields
    await page.getByRole('button', { name: '로그인' }).click();

    // 2. Verify error message appears
    await expect(page.getByText('로그인에 실패했습니다')).toBeVisible();
    await expect(page.getByText('이메일과 비밀번호를 입력해주세요.')).toBeVisible();
  });

  test('Login with Invalid Email Format', async ({ page }) => {
    // 1. Enter invalid email format
    await page.locator('#email').fill('notanemail');

    // 2. Enter password
    await page.locator('#password').fill(TEST_ACCOUNTS.USER.password);

    // 3. Click login button
    await page.getByRole('button', { name: '로그인' }).click();

    // 4. Verify error handling
    await expect(page.getByText('로그인에 실패했습니다')).toBeVisible();
    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeVisible();
  });

  test('Navigation to Register Page', async ({ page }) => {
    // 1. Click '회원가입' button (it's a text button, not a role button)
    await page.getByText('회원가입').click();

    // 2. Verify navigation to /register
    await expect(page).toHaveURL(ROUTES.REGISTER);
  });

  test('Navigation to Password Reset Page', async ({ page }) => {
    // 1. Click '재설정하기' button
    await page.getByText('재설정하기').click();

    // 2. Verify navigation to /password/reset/request
    await expect(page).toHaveURL(ROUTES.FORGOT_PASSWORD);
  });

  test('OAuth Button Presence', async ({ page }) => {
    // 1. Wait for page to load
    await page.getByText('Google로 계속하기').waitFor({ state: 'visible' });

    // 2. Verify Google OAuth button exists
    await expect(page.getByText('Google로 계속하기')).toBeVisible();

    // 3. Verify Kakao OAuth button exists
    await expect(page.getByText('카카오로 계속하기')).toBeVisible();
  });
});
