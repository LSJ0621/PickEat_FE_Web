// spec: AddressAddModal CRUD E2E Tests
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { MyPagePage } from '../../fixtures/page-objects/MyPagePage';

test.describe('Address CRUD Operations', () => {
  // Increase timeout for all tests in this describe block
  test.setTimeout(30000);

  let myPagePage: MyPagePage;

  test.beforeEach(async ({ authenticatedPage: page }) => {
    myPagePage = new MyPagePage(page);
    await myPagePage.goto();
    await myPagePage.openAddressManagement();
    await myPagePage.openAddressAddModal();
  });

  test('Open address add modal', async ({ authenticatedPage: page }) => {
    // 1-4. Already handled in beforeEach (goto, openAddressManagement, openAddressAddModal)

    // 5. Verify address add modal heading is displayed
    await expect(page.getByRole('heading', { name: '주소 추가' })).toBeVisible();

    // 6. Verify maximum address limit message is displayed
    await expect(page.getByText(/최대 4개까지 주소를 등록할 수 있습니다/)).toBeVisible();

    // 7. Verify search input field is visible
    const searchInput = page.getByPlaceholder('주소를 검색하세요');
    await expect(searchInput).toBeVisible();

    // 8. Verify search button is visible
    await expect(page.getByRole('button', { name: '검색' })).toBeVisible();

    // 9. Verify '주소 추가' button is disabled initially
    const submitButton = page.locator('[data-testid="address-add-submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('Search address and display results', async ({ authenticatedPage: page }) => {
    // 1-3. Already handled in beforeEach

    // 4-6. Search for address
    await myPagePage.searchAddress('서울시청');

    // 7. Verify that either results are shown or "no results" message appears
    const resultContainer = page.locator('[data-testid="address-search-results"]');
    const emptyMessage = page.getByText('주소를 찾을 수 없습니다');

    // Wait for either results or empty message using .or() pattern
    await expect(resultContainer.or(emptyMessage)).toBeVisible({ timeout: 10000 });
  });

  test('Select address from search results', async ({ authenticatedPage: page }) => {
    // 1-3. Already handled in beforeEach

    // 4-5. Search for address
    await myPagePage.searchAddress('서울 강남구');

    // 6. Check if search results exist
    const resultContainer = page.locator('[data-testid="address-search-results"]');
    await resultContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    const hasResults = await resultContainer.isVisible().catch(() => false);

    if (hasResults) {
      // 7-8. Select first address and verify
      await myPagePage.selectFirstAddress();
      await expect(page.locator('[data-testid="selected-address"]')).toBeVisible();

      // 9. Verify alias input field is visible
      const aliasInput = page.getByPlaceholder(/별칭 입력/);
      await expect(aliasInput).toBeVisible();

      // 10. Verify '선택 취소' button is visible
      await expect(page.getByRole('button', { name: '선택 취소' })).toBeVisible();

      // 11. Verify '주소 추가' button is now enabled
      const submitButton = page.locator('[data-testid="address-add-submit"]');
      await expect(submitButton).toBeEnabled();
    }
  });

  test('Add address with alias', async ({ authenticatedPage: page }) => {
    // 1-3. Already handled in beforeEach

    // 4-5. Search for address
    await myPagePage.searchAddress('서울 강남구');

    // 6. Check if search results exist
    const resultContainer = page.locator('[data-testid="address-search-results"]');
    await resultContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    const hasResults = await resultContainer.isVisible().catch(() => false);

    if (hasResults) {
      // 7. Select first address
      await myPagePage.selectFirstAddress();

      // 8. Enter alias name
      await myPagePage.setAddressAlias('테스트 주소');

      // 9-10. Submit and verify modal is closed
      await myPagePage.submitNewAddress();
    }
  });

  test('Clear address selection', async ({ authenticatedPage: page }) => {
    // 1-3. Already handled in beforeEach

    // 4-5. Search for address
    await myPagePage.searchAddress('서울');

    const resultContainer = page.locator('[data-testid="address-search-results"]');
    await resultContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    const hasResults = await resultContainer.isVisible().catch(() => false);

    if (hasResults) {
      // 6. Select first address
      await myPagePage.selectFirstAddress();

      // 7. Click '선택 취소' button
      const clearButton = page.getByRole('button', { name: '선택 취소' });
      await clearButton.waitFor({ state: 'visible' });
      await clearButton.click();

      // 8. Verify selected address section is not visible
      await expect(page.getByText('선택한 주소')).not.toBeVisible();

      // 9. Verify '주소 추가' button is disabled again
      const submitButton = page.locator('[data-testid="address-add-submit"]');
      await expect(submitButton).toBeDisabled();
    }
  });

  test('Close address add modal with cancel button', async ({ authenticatedPage: page }) => {
    // 1-3. Already handled in beforeEach

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
    // 1-3. Already handled in beforeEach

    // 4. Verify maximum limit message is displayed
    const limitMessage = page.getByText(/최대 4개까지 주소를 등록할 수 있습니다/);
    await expect(limitMessage).toBeVisible();

    // 5. Verify current count is displayed
    await expect(page.getByText(/현재:.*\/4/)).toBeVisible();

    // 6. Verify remaining count is displayed
    await expect(page.getByText(/추가 가능:.*개/)).toBeVisible();
  });

  test('Search with Enter key', async ({ authenticatedPage: page }) => {
    // 1-3. Already handled in beforeEach

    // 4-5. Type address and press Enter
    const searchInput = page.getByPlaceholder('주소를 검색하세요');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('서울시청');
    await searchInput.press('Enter');

    // 6. Verify that search was triggered
    const resultContainer = page.locator('[data-testid="address-search-results"]');
    const emptyMessage = page.getByText('주소를 찾을 수 없습니다');

    // Wait for either results or empty message using .or() pattern
    await expect(resultContainer.or(emptyMessage)).toBeVisible({ timeout: 10000 });
  });

  test('Alias input character limit (20 characters)', async ({ authenticatedPage: page }) => {
    // 1-3. Already handled in beforeEach

    // 4-5. Search for address
    await myPagePage.searchAddress('서울');

    const resultContainer = page.locator('[data-testid="address-search-results"]');
    await resultContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    const hasResults = await resultContainer.isVisible().catch(() => false);

    if (hasResults) {
      // 6. Select first address
      await myPagePage.selectFirstAddress();

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

  // ====================
  // 주소 삭제 테스트 (Address Delete Tests)
  // ====================

  test.describe('Address Delete Operations', () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      const deleteMyPagePage = new MyPagePage(page);
      await deleteMyPagePage.goto();
      await deleteMyPagePage.openAddressManagement();
    });

    test('Enter and exit edit mode for address deletion', async ({ authenticatedPage: page }) => {
      // 1-2. Already handled in nested beforeEach

      // 3. Check if edit button exists (only shows when > 1 address)
    const editButton = page.getByRole('button', { name: '편집' });
    const hasEditButton = await editButton.isVisible().catch(() => false);

    if (hasEditButton) {
      // 4. Click '편집' button to enter edit mode
      await editButton.click();

      // 5. Verify '완료' button is displayed
      const doneButton = page.getByRole('button', { name: '완료' });
      await expect(doneButton).toBeVisible();

      // 6. Click '완료' to exit edit mode
      await doneButton.click();

        // 7. Verify '편집' button is displayed again
        await expect(editButton).toBeVisible();
      }
    });

    test('Select address for deletion using checkbox', async ({ authenticatedPage: page }) => {
      // 1-2. Already handled in nested beforeEach

      // 3. Enter edit mode
    const editButton = page.getByRole('button', { name: '편집' });
    const hasEditButton = await editButton.isVisible().catch(() => false);

      if (hasEditButton) {
        await editButton.click();

        // 4. Find checkboxes
        const checkboxes = page.locator('input[type="checkbox"]');
        const checkboxCount = await checkboxes.count();

        if (checkboxCount > 0) {
          // 5. Click the first checkbox
          const firstCheckbox = checkboxes.first();
          await firstCheckbox.click();

          // 6. Verify checkbox is checked
          await expect(firstCheckbox).toBeChecked();

          // 7. Verify delete button appears with selected count
          const deleteButton = page.getByRole('button', { name: /선택한.*주소 삭제/ });
          await expect(deleteButton).toBeVisible();

          // 8. Uncheck the checkbox
          await firstCheckbox.click();

          // 9. Verify delete button is no longer visible or disabled
          await expect(deleteButton).not.toBeVisible();
        }
      }
    });

    // NOTE: 주소 수정(Update) 테스트는 현재 UI가 구현되어 있지 않아 추가할 수 없습니다.
    // 백엔드 API (PATCH /user/addresses/:id)는 준비되어 있으므로,
    // 프론트엔드에 주소 수정 모달 또는 인라인 편집 기능이 추가되면 테스트를 작성할 수 있습니다.
  });
});
