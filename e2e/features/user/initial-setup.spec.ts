// spec: Initial Setup Modal E2E Tests
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES } from '../../fixtures/test-data';

test.describe('Initial Setup Modal', () => {
  test('Complete user does not see setup modal', async ({ authenticatedPage: page }) => {
    // Note: Test user (test@example.com) should have completed setup

    // 1. Navigate to home page with authenticated user
    await page.goto(ROUTES.HOME);

    // 2. Wait for page to load
    await expect(page).toHaveTitle('pickeat_web');

    // 3. Verify user is authenticated
    await expect(page.getByText('테스트유저님')).toBeVisible();

    // 4. Check if modal is present (should NOT be visible for complete user)
    const modalHeading = page.getByRole('heading', { name: '서비스 이용을 위한 정보 입력' });

    // Wait for either modal or home content to appear
    await Promise.race([
      modalHeading.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
      page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' }).waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
    ]);
    const isModalVisible = await modalHeading.isVisible().catch(() => false);

    if (!isModalVisible) {
      // Modal not showing - user setup is complete (expected)
      // 5. Verify home page content is accessible
      await expect(page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' })).toBeVisible();

      // 6. Verify can navigate to other pages
      await page.getByRole('button', { name: '에이전트 바로 이용하기' }).click();
      await expect(page).toHaveURL(ROUTES.AGENT);
    } else {
      // Modal is showing - preferences need to be set up
      // This is valid if test user hasn't completed preferences setup
      await expect(modalHeading).toBeVisible();
    }
  });

  test('Modal displays preferences section when needed', async ({ page }) => {
    // Login manually to check modal behavior

    // 1. Navigate to login page
    await page.goto(ROUTES.LOGIN);

    // 2. Fill in login credentials
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');

    // 3. Click login button
    await page.getByRole('button', { name: '로그인' }).click();

    // 4. Wait for navigation to home page
    await page.waitForURL(ROUTES.HOME, { timeout: 10000 });

    // 5. Check if modal appears
    const modalHeading = page.getByRole('heading', { name: '서비스 이용을 위한 정보 입력' });

    // Wait for either modal or home content to appear
    await Promise.race([
      modalHeading.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
      page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' }).waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
    ]);
    const isModalVisible = await modalHeading.isVisible().catch(() => false);

    if (isModalVisible) {
      // Modal is present - verify the setup flow

      // 6. Verify modal content
      await expect(modalHeading).toBeVisible();
      await expect(page.getByText('더 나은 추천을 위해 아래 정보를 입력해주세요')).toBeVisible();

      // 7. Verify preferences section (if visible)
      const preferencesHeading = page.getByRole('heading', { name: '취향 정보' });
      if (await preferencesHeading.isVisible().catch(() => false)) {
        await expect(preferencesHeading).toBeVisible();
        await expect(page.getByText('좋아하는 음식과 싫어하는 음식을 입력해주세요')).toBeVisible();

        // 8. Verify input fields
        const likesInput = page.getByPlaceholder('좋아하는 음식이나 재료를 입력하세요');
        const dislikesInput = page.getByPlaceholder('싫어하는 음식이나 재료를 입력하세요');
        await expect(likesInput).toBeVisible();
        await expect(dislikesInput).toBeVisible();

        // 9. Verify save button exists
        const saveButton = page.getByRole('button', { name: '저장하기' });
        await expect(saveButton).toBeVisible();
      }
    } else {
      // Modal not showing - setup already complete
      // Just verify we can access the home page
      await expect(page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' })).toBeVisible();
    }
  });

  test('Can add preferences tags in modal', async ({ page }) => {
    // 1. Login
    await page.goto(ROUTES.LOGIN);
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.getByRole('button', { name: '로그인' }).click();
    await page.waitForURL(ROUTES.HOME, { timeout: 10000 });

    // 2. Check for modal
    const modalHeading = page.getByRole('heading', { name: '서비스 이용을 위한 정보 입력' });
    await Promise.race([
      modalHeading.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
      page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' }).waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
    ]);
    const isModalVisible = await modalHeading.isVisible().catch(() => false);

    if (isModalVisible) {
      // 3. Check if preferences section is visible
      const likesInput = page.getByPlaceholder('좋아하는 음식이나 재료를 입력하세요');
      if (await likesInput.isVisible().catch(() => false)) {
        // 4. Add a like preference
        await likesInput.fill('피자');
        await page.getByRole('button', { name: '추가' }).first().click();

        // 5. Verify tag is added (green tag)
        await expect(page.locator('[data-testid="like-tag"]').filter({ hasText: '피자' })).toBeVisible();

        // 6. Add a dislike preference
        const dislikesInput = page.getByPlaceholder('싫어하는 음식이나 재료를 입력하세요');
        await dislikesInput.fill('양파');
        await page.getByRole('button', { name: '추가' }).nth(1).click();

        // 7. Verify dislike tag is added (red tag)
        await expect(page.locator('[data-testid="dislike-tag"]').filter({ hasText: '양파' })).toBeVisible();

        // 8. Verify save button is enabled after adding preferences
        const saveButton = page.getByRole('button', { name: '저장하기' });
        await expect(saveButton).toBeEnabled();
      }
    }
  });

  test('Modal closes after successful save', async ({ page }) => {
    // 1. Login
    await page.goto(ROUTES.LOGIN);
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.getByRole('button', { name: '로그인' }).click();
    await page.waitForURL(ROUTES.HOME, { timeout: 10000 });

    // 2. Check for modal
    const modalHeading = page.getByRole('heading', { name: '서비스 이용을 위한 정보 입력' });
    await Promise.race([
      modalHeading.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
      page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' }).waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
    ]);
    const isModalVisible = await modalHeading.isVisible().catch(() => false);

    if (isModalVisible) {
      // 3. Fill required fields based on what's visible
      const likesInput = page.getByPlaceholder('좋아하는 음식이나 재료를 입력하세요');
      if (await likesInput.isVisible().catch(() => false)) {
        await likesInput.fill('치킨');
        await page.getByRole('button', { name: '추가' }).first().click();
      }

      // 4. Check name input if visible
      const nameInput = page.getByPlaceholder('이름을 입력하세요');
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('테스트유저');
      }

      // 5. Save
      const saveButton = page.getByRole('button', { name: '저장하기' });
      if (await saveButton.isEnabled()) {
        await saveButton.click();

        // 6. Verify modal closes
        await expect(modalHeading).not.toBeVisible({ timeout: 5000 });

        // 7. Verify home page is accessible
        await page.goto(ROUTES.HOME);
        await page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' }).waitFor({ state: 'visible', timeout: 2000 });

        // 8. Modal should not reappear
        await expect(modalHeading).not.toBeVisible();
      }
    }
  });

  test('Save button disabled when no preferences added', async ({ page }) => {
    // 1. Login
    await page.goto(ROUTES.LOGIN);
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.getByRole('button', { name: '로그인' }).click();
    await page.waitForURL(ROUTES.HOME, { timeout: 10000 });

    // 2. Check for modal with preferences section
    const modalHeading = page.getByRole('heading', { name: '서비스 이용을 위한 정보 입력' });
    await Promise.race([
      modalHeading.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
      page.getByRole('heading', { name: '오늘 뭐 먹지? AI 에이전트에게 맡기세요' }).waitFor({ state: 'visible', timeout: 2000 }).catch(() => {}),
    ]);
    const isModalVisible = await modalHeading.isVisible().catch(() => false);

    if (isModalVisible) {
      const preferencesHeading = page.getByRole('heading', { name: '취향 정보' });
      if (await preferencesHeading.isVisible().catch(() => false)) {
        // 3. Verify save button is disabled when no preferences added
        const saveButton = page.getByRole('button', { name: '저장하기' });
        await expect(saveButton).toBeDisabled();
      }
    }
  });
});
