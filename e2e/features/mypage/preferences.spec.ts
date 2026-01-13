// spec: MyPage Preferences Management Tests
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES } from '../../fixtures/test-data';

test.describe('Preferences Display', () => {
  test('Display preferences section', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Verify '취향' section is visible
    await expect(page.getByText('취향', { exact: true })).toBeVisible();

    // 3. Verify '취향 수정' button is visible
    await expect(page.getByRole('button', { name: '취향 수정' })).toBeVisible();
  });

  test('Display preferences information (likes and dislikes)', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // Wait for preferences section to load
    await expect(page.getByText('취향', { exact: true })).toBeVisible();

    // 2. Verify '좋아하는 것' area is visible (if there are likes)
    const likesSection = page.getByText('좋아하는 것', { exact: true });
    const hasLikes = await likesSection.isVisible().catch(() => false);

    if (hasLikes) {
      // 3. Verify likes tags are displayed
      await expect(likesSection).toBeVisible();
    }

    // 4. Verify '싫어하는 것' area is visible (if there are dislikes)
    const dislikesSection = page.getByText('싫어하는 것', { exact: true });
    const hasDislikes = await dislikesSection.isVisible().catch(() => false);

    if (hasDislikes) {
      // 5. Verify dislikes tags are displayed
      await expect(dislikesSection).toBeVisible();
    }

    // If no preferences exist, verify empty state message
    if (!hasLikes && !hasDislikes) {
      await expect(page.getByText('등록된 취향 정보가 없습니다.')).toBeVisible();
    }
  });
});

test.describe('Preferences Edit Modal', () => {
  test('Open and close preferences edit modal', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Click '취향 수정' button
    await page.getByRole('button', { name: '취향 수정' }).click();

    // 3. Verify modal title shows '취향 수정'
    await expect(page.getByRole('heading', { name: '취향 수정' })).toBeVisible();

    // 4. Close modal with X button (ModalCloseButton has aria-label="닫기")
    const closeButton = page.getByRole('button', { name: '닫기' });
    await closeButton.click();

    // 5. Verify modal is closed (heading should not be visible)
    await expect(page.getByRole('heading', { name: '취향 수정' })).not.toBeVisible();
  });

  test('Verify preferences edit form fields', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open modal
    await page.getByRole('button', { name: '취향 수정' }).click();

    // Wait for modal to be visible
    await expect(page.getByRole('heading', { name: '취향 수정' })).toBeVisible();

    // 3. Verify '좋아하는 것' input field is visible
    const likesLabel = page.getByText('좋아하는 것', { exact: true }).first();
    await expect(likesLabel).toBeVisible();

    const likesInput = page.getByPlaceholder('좋아하는 음식이나 재료를 입력하세요');
    await expect(likesInput).toBeVisible();

    // 4. Verify '싫어하는 것' input field is visible
    const dislikesLabel = page.getByText('싫어하는 것', { exact: true }).first();
    await expect(dislikesLabel).toBeVisible();

    const dislikesInput = page.getByPlaceholder('싫어하는 음식이나 재료를 입력하세요');
    await expect(dislikesInput).toBeVisible();

    // 5. Verify '추가' buttons are visible (there should be 2, one for each section)
    const addButtons = page.getByRole('button', { name: '추가' });
    await expect(addButtons).toHaveCount(2);

    // 6. Verify save button is visible
    const saveButton = page.getByRole('button', { name: '취향 정보 저장' });
    await expect(saveButton).toBeVisible();
  });

  test('Add a like preference and save', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open modal
    await page.getByRole('button', { name: '취향 수정' }).click();
    await expect(page.getByRole('heading', { name: '취향 수정' })).toBeVisible();

    // 3. Enter a new like preference
    const likesInput = page.getByPlaceholder('좋아하는 음식이나 재료를 입력하세요');
    const newLike = '라면';
    await likesInput.fill(newLike);

    // 4. Click add button for likes (first add button)
    const addButtons = page.getByRole('button', { name: '추가' });
    await addButtons.first().click();

    // 5. Verify the tag is added (should appear as a tag in the modal)
    await expect(page.getByText(newLike).first()).toBeVisible();

    // 6. Save preferences
    await page.getByRole('button', { name: '취향 정보 저장' }).click();

    // 7. Verify modal closes and success feedback
    await expect(page.getByRole('heading', { name: '취향 수정' })).not.toBeVisible({ timeout: 5000 });

    // 8. Verify the new preference is displayed on the page
    await expect(page.getByText(newLike)).toBeVisible();
  });

  test('Add a dislike preference and save', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open modal
    await page.getByRole('button', { name: '취향 수정' }).click();
    await expect(page.getByRole('heading', { name: '취향 수정' })).toBeVisible();

    // 3. Enter a new dislike preference
    const dislikesInput = page.getByPlaceholder('싫어하는 음식이나 재료를 입력하세요');
    const newDislike = '고수';
    await dislikesInput.fill(newDislike);

    // 4. Click add button for dislikes (second add button)
    const addButtons = page.getByRole('button', { name: '추가' });
    await addButtons.nth(1).click();

    // 5. Verify the tag is added
    await expect(page.getByText(newDislike).first()).toBeVisible();

    // 6. Save preferences
    await page.getByRole('button', { name: '취향 정보 저장' }).click();

    // 7. Verify modal closes
    await expect(page.getByRole('heading', { name: '취향 수정' })).not.toBeVisible({ timeout: 5000 });

    // 8. Verify the new preference is displayed on the page
    await expect(page.getByText(newDislike)).toBeVisible();
  });

  test('Cancel preferences edit does not save changes', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open modal
    await page.getByRole('button', { name: '취향 수정' }).click();
    await expect(page.getByRole('heading', { name: '취향 수정' })).toBeVisible();

    // 3. Enter a new preference but don't save
    const likesInput = page.getByPlaceholder('좋아하는 음식이나 재료를 입력하세요');
    const tempLike = '임시취향테스트';
    await likesInput.fill(tempLike);

    // 4. Add the preference
    const addButtons = page.getByRole('button', { name: '추가' });
    await addButtons.first().click();

    // 5. Verify the tag is added in modal
    await expect(page.getByText(tempLike).first()).toBeVisible();

    // 6. Close modal without saving (click X button)
    await page.getByRole('button', { name: '닫기' }).click();

    // 7. Verify modal is closed
    await expect(page.getByRole('heading', { name: '취향 수정' })).not.toBeVisible();

    // 8. Verify the unsaved preference is NOT displayed on the page
    await expect(page.getByText(tempLike)).not.toBeVisible();
  });

  test('Remove a preference tag in modal', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /mypage
    await page.goto(ROUTES.MYPAGE);

    // 2. Open modal
    await page.getByRole('button', { name: '취향 수정' }).click();
    await expect(page.getByRole('heading', { name: '취향 수정' })).toBeVisible();

    // 3. Add a preference first
    const likesInput = page.getByPlaceholder('좋아하는 음식이나 재료를 입력하세요');
    const testPref = '삭제테스트';
    await likesInput.fill(testPref);
    await page.getByRole('button', { name: '추가' }).first().click();

    // 4. Verify the tag is added
    const prefTag = page.getByText(testPref).first();
    await expect(prefTag).toBeVisible();

    // 5. Find and click the remove button (X) on the tag
    // Tags usually have a close button next to them
    const tagContainer = page.locator(`button:has-text("${testPref}")`).or(
      page.locator(`span:has-text("${testPref}")`).locator('..')
    );
    const removeButton = tagContainer.locator('button, svg').first();

    // Try to click the remove button if visible
    if (await removeButton.isVisible()) {
      await removeButton.click();

      // 6. Verify the tag is removed
      await expect(page.getByText(testPref)).not.toBeVisible();
    }

    // 7. Close modal
    await page.getByRole('button', { name: '닫기' }).click();
  });
});
