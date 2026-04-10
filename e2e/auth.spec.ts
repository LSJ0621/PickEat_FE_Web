/**
 * Auth E2E 테스트
 * 회원가입 → 로그인 전체 플로우 검증
 *
 * 사전 조건: 백엔드 E2E_MOCK=true 모드로 실행
 * - 인증 코드는 항상 TEST_VERIFICATION.CODE(123456)로 고정
 * - 신규 이메일 등록이 정상 처리됨
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from './fixtures/page-objects/RegisterPage';
import { LoginPage } from './fixtures/page-objects/LoginPage';
import { TEST_VERIFICATION, ROUTES } from './fixtures/test-data';
import { generateTestEmail } from './fixtures/test-helpers';

test.describe('Auth', () => {
  test('회원가입 → 로그인 전체 플로우', async ({ page }) => {
    // 각 실행마다 고유한 이메일 사용 (동시 병렬 실행 충돌 방지)
    const email = generateTestEmail();
    const password = 'Test@1234';
    const name = '신규유저';

    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);

    // ── 1단계: 회원가입 ───────────────────────────────────────────
    await registerPage.goto();

    // 이메일 입력 → 중복 확인 → 인증 코드 발송 → 코드 입력 → 가입 완료
    await registerPage.performFullRegistration(
      name,
      email,
      password,
      TEST_VERIFICATION.CODE
    );

    // 회원가입 완료 후 로그인 페이지로 이동 확인
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // ── 2단계: 로그인 ────────────────────────────────────────────
    await loginPage.login(email, password);

    // 로그인 성공: 홈으로 이동 + 토큰 저장 확인
    await loginPage.expectLoginSuccess();
  });
});
