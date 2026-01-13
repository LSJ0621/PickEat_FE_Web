// spec: e2e-test-plan/phase-04-home-navigation.plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { ROUTES } from '../../fixtures/test-data';

test.describe('Unauthenticated User Homepage Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.HOME);
    await expect(page).toHaveTitle('pickeat_web');
  });

  test('Header login button navigates to login page', async ({ page }) => {
    // 1. Click the header '로그인' button
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    // 2. Verify login page displays email and password input fields
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });

  test('Hero section login CTA button navigates to login page', async ({ page }) => {
    // 1. Click the hero section '로그인하고 시작하기' button
    await page.getByRole('button', { name: '로그인하고 시작하기' }).click();

    // 2. Verify navigation to login page
    await expect(page.locator('#email')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });

  test('Hero section agent preview button shows authentication prompt', async ({ page }) => {
    // 1. Click the hero section '에이전트 화면 미리보기' button
    await page.getByRole('button', { name: '에이전트 화면 미리보기' }).click();

    // 2. Verify authentication prompt appears
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();
    await expect(page.getByText('해당 기능은 로그인 후 이용할 수 있습니다. 지금 로그인하시겠어요?')).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인하러 가기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '닫기' })).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });

  test('Authentication prompt login button navigates to login page', async ({ page }) => {
    // 1. Click the hero section '에이전트 화면 미리보기' button to trigger authentication prompt
    await page.getByRole('button', { name: '에이전트 화면 미리보기' }).click();

    // 2. Click the '로그인하러 가기' button in authentication prompt
    await page.getByRole('button', { name: '로그인하러 가기' }).click();

    // 3. Verify navigation to login page
    await expect(page.locator('#email')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });

  test('Authentication prompt close button dismisses dialog', async ({ page }) => {
    // 1. Click the hero section '에이전트 화면 미리보기' button to trigger authentication prompt
    await page.getByRole('button', { name: '에이전트 화면 미리보기' }).click();

    // 2. Click the '닫기' button to dismiss the dialog
    await page.getByRole('button', { name: '닫기' }).click();

    // 3. Verify homepage content is still visible and no navigation occurred
    await expect(page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' })).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });

  test('Footer CTA email login button navigates to login page', async ({ page }) => {
    const footerCTAHeading = page.getByRole('heading', { name: '지금 바로 PickEat을 시작해보세요' });

    // 1. Scroll to footer CTA section
    await footerCTAHeading.click();

    // 2. Click the footer '이메일로 로그인' button
    await page.getByRole('button', { name: '이메일로 로그인' }).click();

    // 3. Verify navigation to login page
    await expect(page.locator('#email')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });

  test('Footer CTA agent preview button shows authentication prompt', async ({ page }) => {
    const footerCTAHeading = page.getByRole('heading', { name: '지금 바로 PickEat을 시작해보세요' });

    // 1. Scroll to footer CTA section
    await footerCTAHeading.click();

    // 2. Click the footer '에이전트 미리보기' button
    await page.getByRole('button', { name: '에이전트 미리보기' }).click();

    // 3. Verify authentication prompt appears
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });

  test('Bottom navigation agent button shows authentication prompt', async ({ page }) => {
    // 1. Click the bottom navigation '에이전트' button
    await page.getByRole('button', { name: '에이전트', exact: true }).click();

    // 2. Verify authentication prompt appears
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();
    await expect(page.getByText('해당 기능은 로그인 후 이용할 수 있습니다. 지금 로그인하시겠어요?')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });

  test('Bottom navigation recommendation history button shows authentication prompt', async ({ page }) => {
    // 1. Click the bottom navigation '추천 이력' button
    await page.getByRole('button', { name: '추천 이력' }).click();

    // 2. Verify authentication prompt appears
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();
    await expect(page.getByText('해당 기능은 로그인 후 이용할 수 있습니다. 지금 로그인하시겠어요?')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });

  test('Bottom navigation bug report button shows authentication prompt', async ({ page }) => {
    // 1. Click the bottom navigation '버그 제보' button
    await page.getByRole('button', { name: '버그 제보' }).click();

    // 2. Verify authentication prompt appears
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();
    await expect(page.getByText('해당 기능은 로그인 후 이용할 수 있습니다. 지금 로그인하시겠어요?')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });

  test('Bottom navigation my page button shows authentication prompt', async ({ page }) => {
    // 1. Click the bottom navigation '마이페이지' button
    await page.getByRole('button', { name: '마이페이지' }).click();

    // 2. Verify authentication prompt appears
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();
    await expect(page.getByText('해당 기능은 로그인 후 이용할 수 있습니다. 지금 로그인하시겠어요?')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });

  test('Bottom navigation home button keeps user on homepage', async ({ page }) => {
    // 1. Click the bottom navigation '홈' button
    await page.getByRole('button', { name: '홈' }).click();

    // 2. Verify user remains on homepage
    await expect(page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' })).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });

  test('Header logo button navigates to homepage', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto(ROUTES.LOGIN);
    await expect(page.locator('#email')).toBeVisible();

    // 2. Click the header logo button
    await page.getByRole('button', { name: 'P PickEat Recommendation OS' }).click();

    // 3. Verify navigation to homepage
    await expect(page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' })).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });

  test('Multiple protected route buttons show consistent authentication prompts', async ({ page }) => {
    // 1. Click bottom navigation '에이전트' button
    await page.getByRole('button', { name: '에이전트', exact: true }).click();

    // 2. Verify authentication prompt appears with consistent title
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();
    await page.getByRole('button', { name: '닫기' }).click();

    // 3. Click bottom navigation '추천 이력' button
    await page.getByRole('button', { name: '추천 이력' }).click();

    // 4. Verify same authentication prompt title appears
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();
    await page.getByRole('button', { name: '닫기' }).click();

    // 5. Click hero '에이전트 화면 미리보기' button
    await page.getByRole('button', { name: '에이전트 화면 미리보기' }).click();

    // 6. Verify same authentication prompt title appears
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();

    // 7. Click '로그인하러 가기' to verify navigation
    await page.getByRole('button', { name: '로그인하러 가기' }).click();

    // 8. Verify navigation to login page
    await expect(page.locator('#email')).toBeVisible();
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });

  test('Navigation state preservation after closing authentication prompt', async ({ page }) => {
    const aiFlowHeading = page.getByRole('heading', { name: 'AI 추천 플로우' });

    // 1. Scroll to 'AI 추천 플로우' section
    await aiFlowHeading.click();

    // 2. Verify 'AI 추천 플로우' heading is visible
    await expect(aiFlowHeading).toBeVisible();

    // 3. Click bottom navigation '에이전트' button to test state preservation
    await page.getByRole('button', { name: '에이전트', exact: true }).click();

    // 4. Verify authentication prompt appears
    await expect(page.getByText('로그인이 필요한 서비스입니다')).toBeVisible();

    // 5. Close the authentication prompt
    await page.getByRole('button', { name: '닫기' }).click();

    // 6. Verify page remains scrolled to 'AI 추천 플로우' section after closing dialog
    await expect(aiFlowHeading).toBeVisible();
    await expect(page).toHaveURL(ROUTES.HOME);
  });
});
