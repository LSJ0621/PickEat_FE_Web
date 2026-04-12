/**
 * E2E 테스트 공유 헬퍼.
 *
 * Page Object 패턴은 사용하지 않는다. 셀렉터는 이 파일의 헬퍼 함수에 인라인으로 두거나,
 * 각 spec 내부에 직접 작성한다. 6명의 spec 작성자가 공통으로 필요한 동작만 여기에 모은다.
 */

import { expect, type Page } from '@playwright/test';
import { ROUTES, TEST_ACCOUNTS } from './test-data';

/**
 * 병렬 실행 시 계정 충돌을 방지하기 위한 유니크 테스트 이메일을 생성한다.
 * 회원가입 시나리오에서 사용한다.
 */
export function generateTestEmail(): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `test-${suffix}@example.com`;
}

/**
 * 제목/설명/식별자 등 유니크한 문자열이 필요한 경우 사용한다.
 */
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isAuthResponse(url: string, pathname: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname === pathname || parsed.pathname.endsWith(pathname);
  } catch {
    return false;
  }
}

export async function waitForLoginFormReady(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'PickEat 계정으로 로그인' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: '이메일' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: '이메일' })).toBeEditable();
}

export async function loginWithCredentials(page: Page, email: string, password: string): Promise<void> {
  await waitForLoginFormReady(page);

  const emailInput = page.getByRole('textbox', { name: '이메일' });
  const passwordInput = page.getByLabel('비밀번호');

  await emailInput.fill(email);
  await expect(emailInput).toHaveValue(email);

  await passwordInput.fill(password);
  await expect(passwordInput).toHaveValue(password);

  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      isAuthResponse(response.url(), '/auth/login'),
  );

  await page.getByRole('button', { name: '로그인', exact: true }).click();
  expect((await loginResponsePromise).ok()).toBeTruthy();
}

/**
 * 시드된 일반 유저(test@example.com)로 로그인한다.
 * 로그인 후 홈(`/`)으로 이동하는 것을 대기한다.
 *
 * 로그인 페이지 DOM:
 *   - 이메일 input: id="email" (Label: "이메일")
 *   - 비밀번호 input: id="password" (Label: "비밀번호")
 *   - 로그인 버튼: role=button, name="로그인"
 */
export async function loginAsRegularUser(page: Page): Promise<void> {
  await page.goto(ROUTES.LOGIN);
  await loginWithCredentials(page, TEST_ACCOUNTS.REGULAR.email, TEST_ACCOUNTS.REGULAR.password);
  await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`), { timeout: 10000 });
}

/**
 * 시드된 어드민 유저(admin@pickeat.com)로 로그인한다.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(ROUTES.LOGIN);
  await loginWithCredentials(page, TEST_ACCOUNTS.ADMIN.email, TEST_ACCOUNTS.ADMIN.password);
  await expect(page).not.toHaveURL(ROUTES.LOGIN, { timeout: 10000 });
}

/**
 * Toast 메시지가 화면에 노출되는지 검증한다.
 * Toast 컴포넌트는 `role="status"` 로 렌더링된다 (`src/shared/components/Toast.tsx`).
 */
export async function expectToast(page: Page, message: string | RegExp): Promise<void> {
  await expect(
    page.getByRole('status').filter({ hasText: message }).first()
  ).toBeVisible({ timeout: 5000 });
}
