/**
 * Auth E2E — 회원가입 → 로그인 플로우
 *
 * 시나리오 (docs/testing/scenarios/auth.md — Frontend E2E):
 *   - 이메일 입력 → 중복 확인 → 인증 코드 발송 → 코드 입력
 *     → 가입 정보 입력 → 가입 완료 → 로그인 성공
 *
 * 전제: BE가 E2E_MOCK=true 로 기동되어 있어 인증 코드는 항상 123456.
 */

import { test, expect } from '@playwright/test';
import { ROUTES, TEST_VERIFICATION_CODE } from './fixtures/test-data';
import { generateTestEmail, loginWithCredentials, waitForLoginFormReady } from './fixtures/test-helpers';

function isAuthResponse(url: string, pathname: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname === pathname || parsed.pathname.endsWith(pathname);
  } catch {
    return false;
  }
}

test.describe('Auth: 회원가입 → 로그인', () => {
  test('이메일 입력 → 중복 확인 → 인증 코드 발송 → 코드 입력 → 가입 정보 입력 → 가입 완료 → 로그인 성공', async ({
    page,
  }) => {
    const email = generateTestEmail();
    const password = 'password123';
    const name = 'E2E Tester';

    // --- 1) 회원가입 페이지 이동 ---
    await page.goto(ROUTES.REGISTER);
    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();

    // --- 2) 이름 입력 ---
    await page.getByLabel('이름').fill(name);

    // --- 3) 이메일 입력 + 중복 확인 ---
    await page.getByLabel('이메일').fill(email);
    const checkEmailResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        isAuthResponse(response.url(), '/auth/check-email'),
    );
    await page.getByRole('button', { name: '중복 확인' }).click();
    expect((await checkEmailResponsePromise).ok()).toBeTruthy();
    await expect(page.getByText('사용 가능한 이메일입니다.')).toBeVisible({ timeout: 5000 });

    // --- 4) 인증번호 발송 ---
    const sendCodeResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        isAuthResponse(response.url(), '/auth/email/send-code'),
    );
    await page.getByRole('button', { name: /인증번호 발송/ }).click();
    expect((await sendCodeResponsePromise).ok()).toBeTruthy();

    // 발송 성공 시 6자리 코드 입력 필드가 활성화된다.
    const codeInput = page.locator('input[maxlength="6"]');
    await expect(codeInput).toBeEnabled({ timeout: 5000 });

    // --- 5) 인증 코드 입력 + 검증 ---
    await codeInput.fill(TEST_VERIFICATION_CODE);
    // EmailVerificationSection 내부의 확인 버튼(common.confirm = "확인")
    const verifyCodeResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        isAuthResponse(response.url(), '/auth/email/verify-code'),
    );
    await page.getByRole('button', { name: '확인', exact: true }).click();
    expect((await verifyCodeResponsePromise).ok()).toBeTruthy();

    // 이메일 액션 버튼 라벨이 "인증 완료"로 바뀌면 검증 성공.
    await expect(page.getByRole('button', { name: '인증 완료' })).toBeVisible({ timeout: 5000 });

    // --- 6) 비밀번호 입력 ---
    await page.getByLabel('비밀번호', { exact: true }).fill(password);
    await page.getByLabel('비밀번호 확인').fill(password);

    // --- 7) 생년월일 선택 (iOS-style 3-column 스크롤 피커) ---
    // 각 컬럼의 scrollTop 을 ITEM_HEIGHT(44px) 단위로 세팅 후 scroll 이벤트를 디스패치하여
    // onSelect 콜백을 강제로 트리거한다.
    await page.evaluate(() => {
      const ITEM = 44;
      const scrollers = Array.from(
        document.querySelectorAll<HTMLDivElement>('div.overflow-y-auto')
      );
      // ScrollDatePicker 는 year / month / day 순서로 overflow-y-auto 컨테이너 3개를 렌더한다.
      if (scrollers.length < 3) {
        throw new Error(`ScrollDatePicker columns not found (found ${scrollers.length})`);
      }
      const setCol = (el: HTMLDivElement, idx: number) => {
        el.scrollTop = idx * ITEM;
        el.dispatchEvent(new Event('scroll'));
      };
      // year: index 0 = "미설정", index 1 = maxYear(최근연도).
      setCol(scrollers[0], 1);
      // month: index 0 = 1월.
      setCol(scrollers[1], 0);
      // day: index 0 = 1일.
      setCol(scrollers[2], 0);
    });
    // ScrollColumn 의 scroll 핸들러는 150ms 디바운스 처리되어 있다.
    await page.waitForTimeout(400);

    // --- 8) 성별 선택 (남성) ---
    await page.getByRole('radio', { name: '남성' }).check();

    // --- 9) 회원가입 제출 ---
    const submitButton = page.getByRole('button', { name: '회원가입', exact: true });
    await expect(submitButton).toBeEnabled({ timeout: 3000 });
    const registerResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        isAuthResponse(response.url(), '/auth/register'),
    );
    await submitButton.click();
    expect((await registerResponsePromise).ok()).toBeTruthy();

    // --- 10) 로그인 페이지로 리다이렉트 ---
    await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}$`), { timeout: 10000 });
    await waitForLoginFormReady(page);

    // --- 11) 방금 가입한 계정으로 로그인 ---
    await loginWithCredentials(page, email, password);

    // --- 12) 홈으로 이동 확인 ---
    await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`), { timeout: 10000 });
  });
});
