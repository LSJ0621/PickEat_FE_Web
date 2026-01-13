// spec: e2e-test-plan/01-authentication.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import {
  TEST_ACCOUNTS,
  TEST_VERIFICATION,
  ROUTES,
  TIMEOUTS,
} from '../fixtures/test-data';

test.describe('Registration - UI Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.REGISTER);
    await page.getByText('회원가입').first().waitFor({ state: 'visible' });
  });

  test('회원가입 폼 필드 존재 확인', async ({ page }) => {
    // 모든 폼 필드 존재 확인
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.getByRole('textbox', { name: '6자리 인증번호 입력' })).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();

    // 회원가입 버튼 기본 비활성화
    await expect(page.getByRole('button', { name: '회원가입' })).toBeDisabled();

    // 중복 확인 버튼 기본 비활성화
    await expect(page.getByRole('button', { name: '중복 확인' })).toBeDisabled();
  });

  test('이메일 입력 시 중복 확인 버튼 활성화', async ({ page }) => {
    await page.locator('#name').fill('테스트사용자');
    await page.locator('#email').fill('newuser@test.com');

    await expect(page.getByRole('button', { name: '중복 확인' })).toBeEnabled();
  });

  test('비밀번호 불일치 검증', async ({ page }) => {
    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill('user@test.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('different456');

    await expect(page.getByText('비밀번호가 일치하지 않습니다.')).toBeVisible();
    await expect(page.getByRole('button', { name: '회원가입' })).toBeDisabled();
  });

  test('짧은 비밀번호 검증', async ({ page }) => {
    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill('user@test.com');
    await page.locator('#password').fill('test');
    await page.locator('#confirmPassword').fill('test');

    await expect(page.getByText('비밀번호는 최소 6자 이상이어야 합니다.')).toBeVisible();
    await expect(page.getByRole('button', { name: '회원가입' })).toBeDisabled();
  });

  test('빈 이름 필드 검증', async ({ page }) => {
    // 이름 비워두고 나머지 입력
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password123');

    await expect(page.getByRole('button', { name: '회원가입' })).toBeDisabled();
  });

  test('로그인 페이지로 이동', async ({ page }) => {
    await expect(page.getByText('이미 계정이 있으신가요?')).toBeVisible();
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page).toHaveURL(ROUTES.LOGIN);
  });
});

test.describe('Registration - API Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.REGISTER);
    await page.getByText('회원가입').first().waitFor({ state: 'visible' });
  });

  test('이메일 중복 확인 - 이미 등록된 이메일', async ({ page }) => {
    // 이름 입력
    await page.locator('#name').fill('테스트');

    // 이미 등록된 이메일 입력 (테스트 계정)
    await page.locator('#email').fill(TEST_ACCOUNTS.USER.email);

    // 중복 확인 버튼 클릭
    await page.getByRole('button', { name: '중복 확인' }).click();

    // 중복 에러 메시지 확인
    await expect(page.getByText('이미 사용 중인 이메일입니다')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  });

  test('이메일 중복 확인 - 사용 가능한 이메일', async ({ page }) => {
    // 이름 입력
    await page.locator('#name').fill('테스트');

    // 새 이메일 입력
    const newEmail = `test-${Date.now()}@example.com`;
    await page.locator('#email').fill(newEmail);

    // 중복 확인 버튼 클릭
    await page.getByRole('button', { name: '중복 확인' }).click();

    // 사용 가능 메시지 확인
    await expect(page.getByText('사용 가능한 이메일입니다')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  });

  test('인증코드 발송 및 입력', async ({ page }) => {
    // 이름 입력
    await page.locator('#name').fill('테스트유저');

    // 새 이메일 입력
    const newEmail = `test-${Date.now()}@example.com`;
    await page.locator('#email').fill(newEmail);

    // 중복 확인
    await page.getByRole('button', { name: '중복 확인' }).click();
    await expect(page.getByText('사용 가능한 이메일입니다')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

    // 인증번호 발송 버튼 클릭
    await page.getByRole('button', { name: '인증번호 발송' }).click();

    // 인증코드 입력 필드가 활성화됨
    const codeInput = page.getByRole('textbox', { name: '6자리 인증번호 입력' });
    await expect(codeInput).toBeEnabled({ timeout: TIMEOUTS.MEDIUM });

    // 테스트 모드 고정 인증코드 입력
    await codeInput.fill(TEST_VERIFICATION.CODE);

    // 확인 버튼 클릭
    await page.getByRole('button', { name: '확인' }).click();

    // 인증 완료 메시지
    await expect(page.getByText('이메일 인증이 완료되었습니다')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  });

  test('전체 회원가입 플로우', async ({ page }) => {
    // 1. 이름 입력
    await page.locator('#name').fill('신규테스트유저');

    // 2. 이메일 입력 (유니크한 이메일)
    const newEmail = `register-test-${Date.now()}@example.com`;
    await page.locator('#email').fill(newEmail);

    // 3. 중복 확인
    await page.getByRole('button', { name: '중복 확인' }).click();
    await expect(page.getByText('사용 가능한 이메일입니다')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

    // 4. 인증번호 발송
    await page.getByRole('button', { name: '인증번호 발송' }).click();

    // 5. 인증코드 입력 및 확인
    const codeInput = page.getByRole('textbox', { name: '6자리 인증번호 입력' });
    await expect(codeInput).toBeEnabled({ timeout: TIMEOUTS.MEDIUM });
    await codeInput.fill(TEST_VERIFICATION.CODE);
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByText('이메일 인증이 완료되었습니다')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

    // 6. 비밀번호 입력
    await page.locator('#password').fill('newpassword123');
    await page.locator('#confirmPassword').fill('newpassword123');

    // 7. 회원가입 버튼 활성화 확인 및 클릭
    const submitButton = page.getByRole('button', { name: '회원가입' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // 8. 로그인 페이지로 리다이렉트됨 (회원가입 성공)
    await expect(page).toHaveURL(ROUTES.LOGIN, { timeout: TIMEOUTS.MEDIUM });
  });

  test('잘못된 인증코드 입력', async ({ page }) => {
    // 이름 입력
    await page.locator('#name').fill('테스트유저');

    // 새 이메일 입력
    const newEmail = `test-${Date.now()}@example.com`;
    await page.locator('#email').fill(newEmail);

    // 중복 확인
    await page.getByRole('button', { name: '중복 확인' }).click();
    await expect(page.getByText('사용 가능한 이메일입니다')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

    // 인증번호 발송
    await page.getByRole('button', { name: '인증번호 발송' }).click();

    // 잘못된 인증코드 입력
    const codeInput = page.getByRole('textbox', { name: '6자리 인증번호 입력' });
    await expect(codeInput).toBeEnabled({ timeout: TIMEOUTS.MEDIUM });
    await codeInput.fill(TEST_VERIFICATION.INVALID_CODE);

    // 확인 버튼 클릭
    await page.getByRole('button', { name: '확인' }).click();

    // 에러 메시지 확인 (백엔드: "코드가 유효하지 않습니다")
    await expect(
      page.getByText('코드가 유효하지 않습니다').or(page.getByText('인증번호가 일치하지 않습니다'))
    ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  });
});
