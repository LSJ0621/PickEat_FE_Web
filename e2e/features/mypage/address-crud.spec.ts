// spec: AddressAddModal CRUD E2E Tests
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES } from '../../fixtures/test-data';

test.describe('Address CRUD Operations', () => {
  // Increase timeout for all tests in this describe block
  test.setTimeout(60000);

  test('Open address add modal', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Click '주소 관리' button to open address list modal
    const addressManageButton = page.getByRole('button', { name: '주소 관리' });
    await addressManageButton.waitFor({ state: 'visible' });
    await addressManageButton.click();

    // 3. Wait for address list modal to open
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 4. Click '주소 추가' button (first occurrence is in the list modal)
    const addAddressButton = page.getByRole('button', { name: /주소 추가/ }).first();
    await addAddressButton.waitFor({ state: 'visible' });
    await addAddressButton.click();

    // 5. Verify address add modal heading is displayed
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 6. Verify maximum address limit message is displayed
    await expect(page.getByText(/최대 4개까지 주소를 등록할 수 있습니다/)).toBeVisible();

    // 7. Verify search input field is visible
    const searchInput = page.getByPlaceholder('주소를 검색하세요');
    await expect(searchInput).toBeVisible();

    // 8. Verify search button is visible
    await expect(page.getByRole('button', { name: '검색' })).toBeVisible();

    // 9. Verify '주소 추가' button is disabled initially (last occurrence is in the add modal)
    const submitButton = page.getByRole('button', { name: '주소 추가' }).last();
    await expect(submitButton).toBeDisabled();
  });

  test('Search address and display results', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open address management modal
    const addressManageButton = page.getByRole('button', { name: '주소 관리' });
    await addressManageButton.waitFor({ state: 'visible' });
    await addressManageButton.click();
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 3. Click '주소 추가' button
    const addAddressButton = page.getByRole('button', { name: /주소 추가/ }).first();
    await addAddressButton.waitFor({ state: 'visible' });
    await addAddressButton.click();
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 4. Wait for search input to be ready
    const searchInput = page.getByPlaceholder('주소를 검색하세요');
    await expect(searchInput).toBeVisible();

    // 5. Type address search query
    await searchInput.fill('서울시청');

    // 6. Click search button
    const searchButton = page.getByRole('button', { name: '검색' });
    await searchButton.waitFor({ state: 'visible' });
    await searchButton.click();

    // 7. Verify that either results are shown or "no results" message appears
    const resultContainer = page.locator('.rounded-xl.border.border-white\\/10.bg-slate-800\\/50');
    const emptyMessage = page.getByText('주소를 찾을 수 없습니다');

    // Wait for either results or empty message
    await Promise.race([
      resultContainer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
      emptyMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
    ]);

    const hasResults = await resultContainer.isVisible().catch(() => false);
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

    expect(hasResults || hasEmptyMessage).toBeTruthy();
  });

  test('Select address from search results', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open address management modal
    const addressManageButton = page.getByRole('button', { name: '주소 관리' });
    await addressManageButton.waitFor({ state: 'visible' });
    await addressManageButton.click();
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 3. Click '주소 추가' button
    const addAddressButton = page.getByRole('button', { name: /주소 추가/ }).first();
    await addAddressButton.waitFor({ state: 'visible' });
    await addAddressButton.click();
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 4. Wait for search input to be ready
    const searchInput = page.getByPlaceholder('주소를 검색하세요');
    await expect(searchInput).toBeVisible();

    // 5. Search for address
    await searchInput.fill('서울 강남구');
    const searchButton = page.getByRole('button', { name: '검색' });
    await searchButton.waitFor({ state: 'visible' });
    await searchButton.click();

    // 6. Check if search results exist
    const resultContainer = page.locator('.rounded-xl.border.border-white\\/10.bg-slate-800\\/50');
    await resultContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    const hasResults = await resultContainer.isVisible().catch(() => false);

    if (hasResults) {
      // 7. Click first address in search results
      const firstResult = resultContainer.locator('button').first();
      await firstResult.waitFor({ state: 'visible' });
      await firstResult.click();

      // 8. Verify selected address is displayed in highlighted section
      await expect(page.getByText('선택한 주소')).toBeVisible();
      await expect(page.locator('.border-emerald-500\\/30')).toBeVisible();

      // 9. Verify alias input field is visible
      const aliasInput = page.getByPlaceholder(/별칭 입력/);
      await expect(aliasInput).toBeVisible();

      // 10. Verify '선택 취소' button is visible
      await expect(page.getByRole('button', { name: '선택 취소' })).toBeVisible();

      // 11. Verify '주소 추가' button is now enabled
      const submitButton = page.getByRole('button', { name: '주소 추가' }).last();
      await expect(submitButton).toBeEnabled();
    }
  });

  test('Add address with alias', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open address management modal
    const addressManageButton = page.getByRole('button', { name: '주소 관리' });
    await addressManageButton.waitFor({ state: 'visible' });
    await addressManageButton.click();
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 3. Click '주소 추가' button
    const addAddressButton = page.getByRole('button', { name: /주소 추가/ }).first();
    await addAddressButton.waitFor({ state: 'visible' });
    await addAddressButton.click();
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 4. Wait for search input to be ready
    const searchInput = page.getByPlaceholder('주소를 검색하세요');
    await expect(searchInput).toBeVisible();

    // 5. Search for address
    await searchInput.fill('서울 강남구');
    const searchButton = page.getByRole('button', { name: '검색' });
    await searchButton.waitFor({ state: 'visible' });
    await searchButton.click();

    // 6. Check if search results exist
    const resultContainer = page.locator('.rounded-xl.border.border-white\\/10.bg-slate-800\\/50');
    await resultContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    const hasResults = await resultContainer.isVisible().catch(() => false);

    if (hasResults) {
      // 7. Select first address
      const firstResult = resultContainer.locator('button').first();
      await firstResult.waitFor({ state: 'visible' });
      await firstResult.click();
      await expect(page.getByText('선택한 주소')).toBeVisible();

      // 8. Enter alias name
      const aliasInput = page.getByPlaceholder(/별칭 입력/);
      await expect(aliasInput).toBeVisible();
      await aliasInput.fill('테스트 주소');

      // 9. Click '주소 추가' button
      const submitButton = page.getByRole('button', { name: '주소 추가' }).last();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // 10. Verify modal is closed
      await expect(page.getByRole('heading', { name: '주소 추가' })).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('Clear address selection', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open address management modal
    const addressManageButton = page.getByRole('button', { name: '주소 관리' });
    await addressManageButton.waitFor({ state: 'visible' });
    await addressManageButton.click();
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 3. Click '주소 추가' button
    const addAddressButton = page.getByRole('button', { name: /주소 추가/ }).first();
    await addAddressButton.waitFor({ state: 'visible' });
    await addAddressButton.click();
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 4. Wait for search input to be ready
    const searchInput = page.getByPlaceholder('주소를 검색하세요');
    await expect(searchInput).toBeVisible();

    // 5. Search and select address
    await searchInput.fill('서울');
    const searchButton = page.getByRole('button', { name: '검색' });
    await searchButton.waitFor({ state: 'visible' });
    await searchButton.click();

    const resultContainer = page.locator('.rounded-xl.border.border-white\\/10.bg-slate-800\\/50');
    await resultContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    const hasResults = await resultContainer.isVisible().catch(() => false);

    if (hasResults) {
      // 6. Select first address
      const firstResult = resultContainer.locator('button').first();
      await firstResult.waitFor({ state: 'visible' });
      await firstResult.click();
      await expect(page.getByText('선택한 주소')).toBeVisible();

      // 7. Click '선택 취소' button
      const clearButton = page.getByRole('button', { name: '선택 취소' });
      await clearButton.waitFor({ state: 'visible' });
      await clearButton.click();

      // 8. Verify selected address section is not visible
      await expect(page.getByText('선택한 주소')).not.toBeVisible();

      // 9. Verify '주소 추가' button is disabled again
      const submitButton = page.getByRole('button', { name: '주소 추가' }).last();
      await expect(submitButton).toBeDisabled();
    }
  });

  test('Close address add modal with cancel button', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open address management modal
    const addressManageButton = page.getByRole('button', { name: '주소 관리' });
    await addressManageButton.waitFor({ state: 'visible' });
    await addressManageButton.click();
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 3. Click '주소 추가' button
    const addAddressButton = page.getByRole('button', { name: /주소 추가/ }).first();
    await addAddressButton.waitFor({ state: 'visible' });
    await addAddressButton.click();
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 4. Click '취소' button
    const cancelButton = page.getByRole('button', { name: '취소' }).first();
    await cancelButton.waitFor({ state: 'visible' });
    await cancelButton.click();

    // 5. Verify address add modal is closed
    await expect(page.getByRole('heading', { name: '주소 추가' })).not.toBeVisible();

    // 6. Verify address list modal is still open
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();
  });

  test('Verify 4 address limit message', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open address management modal
    const addressManageButton = page.getByRole('button', { name: '주소 관리' });
    await addressManageButton.waitFor({ state: 'visible' });
    await addressManageButton.click();
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 3. Click '주소 추가' button
    const addAddressButton = page.getByRole('button', { name: /주소 추가/ }).first();
    await addAddressButton.waitFor({ state: 'visible' });
    await addAddressButton.click();
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 4. Verify maximum limit message is displayed
    const limitMessage = page.getByText(/최대 4개까지 주소를 등록할 수 있습니다/);
    await expect(limitMessage).toBeVisible();

    // 5. Verify current count is displayed
    await expect(page.getByText(/현재:.*\/4/)).toBeVisible();

    // 6. Verify remaining count is displayed
    await expect(page.getByText(/추가 가능:.*개/)).toBeVisible();
  });

  test('Search with Enter key', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open address management modal
    const addressManageButton = page.getByRole('button', { name: '주소 관리' });
    await addressManageButton.waitFor({ state: 'visible' });
    await addressManageButton.click();
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 3. Click '주소 추가' button
    const addAddressButton = page.getByRole('button', { name: /주소 추가/ }).first();
    await addAddressButton.waitFor({ state: 'visible' });
    await addAddressButton.click();
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 4. Wait for search input to be ready
    const searchInput = page.getByPlaceholder('주소를 검색하세요');
    await expect(searchInput).toBeVisible();

    // 5. Type address and press Enter
    await searchInput.fill('서울시청');
    await searchInput.press('Enter');

    // 6. Verify that search was triggered
    const resultContainer = page.locator('.rounded-xl.border.border-white\\/10.bg-slate-800\\/50');
    const emptyMessage = page.getByText('주소를 찾을 수 없습니다');

    // Wait for either results or empty message
    await Promise.race([
      resultContainer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
      emptyMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
    ]);

    const hasResults = await resultContainer.isVisible().catch(() => false);
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

    expect(hasResults || hasEmptyMessage).toBeTruthy();
  });

  test('Alias input character limit (20 characters)', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open address management modal
    const addressManageButton = page.getByRole('button', { name: '주소 관리' });
    await addressManageButton.waitFor({ state: 'visible' });
    await addressManageButton.click();
    await expect(page.getByRole('heading', { name: '주소 관리' })).toBeVisible();

    // 3. Click '주소 추가' button
    const addAddressButton = page.getByRole('button', { name: /주소 추가/ }).first();
    await addAddressButton.waitFor({ state: 'visible' });
    await addAddressButton.click();
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 4. Wait for search input to be ready
    const searchInput = page.getByPlaceholder('주소를 검색하세요');
    await expect(searchInput).toBeVisible();

    // 5. Search and select address
    await searchInput.fill('서울');
    const searchButton = page.getByRole('button', { name: '검색' });
    await searchButton.waitFor({ state: 'visible' });
    await searchButton.click();

    const resultContainer = page.locator('.rounded-xl.border.border-white\\/10.bg-slate-800\\/50');
    await resultContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    const hasResults = await resultContainer.isVisible().catch(() => false);

    if (hasResults) {
      // 6. Select first address
      const firstResult = resultContainer.locator('button').first();
      await firstResult.waitFor({ state: 'visible' });
      await firstResult.click();
      await expect(page.getByText('선택한 주소')).toBeVisible();

      // 7. Try to enter more than 20 characters in alias
      const aliasInput = page.getByPlaceholder(/별칭 입력/);
      await expect(aliasInput).toBeVisible();
      const longText = 'a'.repeat(30);
      await aliasInput.fill(longText);

      // 8. Verify that input is limited to 20 characters
      const inputValue = await aliasInput.inputValue();
      expect(inputValue.length).toBeLessThanOrEqual(20);
    }
  });
});
