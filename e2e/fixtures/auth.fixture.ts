/**
 * Playwright 커스텀 픽스처.
 *
 * `authedPage` 픽스처는 시드된 일반 유저로 로그인된 상태의 Page를 제공한다.
 * 로그인이 필요한 테스트는 이 파일의 `test` 를 import 하여 사용한다.
 *
 * 사용 예:
 *   import { test, expect } from './fixtures/auth.fixture';
 *   test('마이페이지 진입', async ({ authedPage }) => {
 *     await authedPage.goto('/mypage');
 *   });
 */

import { test as base, type Page } from '@playwright/test';
import { loginAsRegularUser } from './test-helpers';

interface AuthFixtures {
  authedPage: Page;
}

export const test = base.extend<AuthFixtures>({
  page: async ({ page }, use) => {
    // 모든 테스트 페이지에서 온보딩 모달이 클릭을 가리지 않도록
    // localStorage에 완료 플래그를 미리 주입한다.
    await page.addInitScript(() => {
      window.localStorage.setItem('onboardingCompleted', 'true');
    });
    await use(page);
  },
  authedPage: async ({ page }, use) => {
    await loginAsRegularUser(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
