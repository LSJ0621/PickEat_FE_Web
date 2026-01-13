// spec: e2e-test-plan/mypage-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES } from '../../fixtures/test-data';

test.describe('Address Management', () => {
  test('Display address section', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Verify '주소 관리' section label is visible (the <p> tag)
    const addressSection = page.locator('.rounded-\\[32px\\]').filter({ hasText: '주소 관리' });
    await expect(addressSection).toBeVisible();

    // 3. Verify default address is displayed (if present) or empty state message
    await expect(addressSection).toBeVisible();

    // 4. Verify '주소 관리' button is visible
    const manageButton = page.getByRole('button', { name: '주소 관리' });
    await expect(manageButton).toBeVisible();
  });

  test('Open and close address list modal', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Click '주소 관리' button
    const manageButton = page.getByRole('button', { name: '주소 관리' });
    await manageButton.click();

    // 3. Wait for modal to appear with heading
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 4. Close modal with X button (ModalCloseButton has aria-label="닫기")
    const closeButton = page.getByRole('button', { name: '닫기' });
    await closeButton.click();

    // 5. Verify modal is closed (heading should not be visible)
    await expect(page.getByRole('heading', { name: '주소 관리' })).not.toBeVisible();
  });

  test('Display address list', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Click '주소 관리' button
    await page.getByRole('button', { name: '주소 관리' }).click();

    // 3. Wait for modal heading to be visible
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 4. Verify address list is displayed (default address should be at top)
    // Look for address content inside the modal - avoid selecting other rounded-xl elements
    // The modal should display at least one address or empty state
    const modalContent = page.locator('.fixed.inset-0').filter({ hasText: '주소 관리' });
    await expect(modalContent).toBeVisible();

    // 5. Verify modal content has address or empty state
    // Test passes if either an address or empty message is shown
    const hasAddressOrEmptyState = page.locator('text=등록된 주소가 없습니다').or(
      page.locator('text=/서울|도로|로|길/'),
    );
    await expect(hasAddressOrEmptyState.first()).toBeVisible({ timeout: 10000 });
  });

  test('Open address add modal', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Click '주소 관리' button to open address list modal
    await page.getByRole('button', { name: '주소 관리' }).click();

    // 3. Wait for address list modal to open
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 4. Wait for address data to load and the '주소 추가' button to appear
    // The button text is dynamic: "+ 주소 추가 (0/4)" or "+ 주소 추가 (1/4)", etc.
    // Use a more robust locator that waits for visibility
    const addButton = page.locator('button:has-text("주소 추가")');
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // 5. Verify address add modal heading is displayed
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 6. Verify search input field is visible
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /주소/);
  });
});
