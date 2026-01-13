import { test, expect } from '@playwright/test';
import { OAUTH_TEST_CODES, ROUTES } from '../fixtures/test-data';

/**
 * Google OAuth Callback 테스트
 *
 * 백엔드 E2E Mock 모드의 테스트 코드를 사용합니다:
 * - test-valid-code: 정상 로그인
 * - test-deleted-user-code: 탈퇴한 사용자 (재가입 모달)
 * - invalid-code: 401 에러 반환
 *
 * Note: Google OAuth는 이름을 자동으로 제공하므로 이름 입력 시나리오는 없음
 */
test.describe('Google OAuth Callback', () => {
  // 각 테스트 전에 로그아웃 상태로 초기화
  test.beforeEach(async ({ page }) => {
    // 홈페이지로 이동하여 앱 초기화 후 localStorage 클리어
    await page.goto(ROUTES.HOME);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('구글 콜백 성공 - 정상 로그인', async ({ page }) => {
    // 백엔드 테스트 코드 사용 (page.route 불필요)
    await page.goto(`${ROUTES.OAUTH_GOOGLE_REDIRECT}?code=${OAUTH_TEST_CODES.VALID}`);

    // 홈페이지(/)로 리다이렉트됨
    await expect(page).toHaveURL(ROUTES.HOME, { timeout: 10000 });

    // localStorage에 토큰이 저장됨
    const hasToken = await page.evaluate(() => {
      const token = localStorage.getItem('token');
      return !!token;
    });
    expect(hasToken).toBe(true);
  });

  // Google OAuth는 이름을 자동으로 제공하므로 이름 입력 모달이 없음
  // 이 테스트는 카카오 OAuth 전용이므로 제거함

  test('구글 콜백 성공 - 탈퇴 사용자 (재가입 모달)', async ({ page }) => {
    // 백엔드 테스트 코드 사용
    await page.goto(`${ROUTES.OAUTH_GOOGLE_REDIRECT}?code=${OAUTH_TEST_CODES.DELETED_USER}`);

    // 재가입 모달 표시
    await expect(page.getByText('재가입 안내')).toBeVisible({ timeout: 10000 });

    // 재가입할 이메일 정보 표시 확인
    await expect(page.getByText('재가입할 이메일')).toBeVisible();

    // 재가입 버튼 클릭
    await page.getByRole('button', { name: '재가입' }).click();

    // 재가입 완료 토스트 메시지 확인
    await expect(page.getByText('재가입이 완료되었습니다. 로그인해주세요.')).toBeVisible({ timeout: 10000 });

    // 로그인 페이지로 리다이렉트 (재가입 후 자동 로그인 없음)
    await expect(page).toHaveURL(ROUTES.LOGIN, { timeout: 10000 });
  });

  test('구글 콜백 실패 - 잘못된 코드', async ({ page }) => {
    // 백엔드 테스트 코드 사용 (invalid-code → 401 에러)
    await page.goto(`${ROUTES.OAUTH_GOOGLE_REDIRECT}?code=${OAUTH_TEST_CODES.INVALID}`);

    // 에러 메시지 표시 확인
    await expect(page.getByText(/로그인에 실패했습니다/)).toBeVisible({ timeout: 10000 });

    // 로그인 페이지로 돌아가기 버튼 확인
    await expect(page.getByRole('button', { name: '로그인 페이지로 돌아가기' })).toBeVisible();
  });

  test('구글 콜백 - 코드 없음', async ({ page }) => {
    // code 파라미터 없이 접근
    await page.goto(ROUTES.OAUTH_GOOGLE_REDIRECT);

    // 에러 메시지 표시
    await expect(page.getByText('인증 코드를 받지 못했습니다.')).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인 페이지로 돌아가기' })).toBeVisible();
  });
});
