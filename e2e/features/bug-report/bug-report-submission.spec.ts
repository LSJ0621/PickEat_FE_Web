// spec: e2e-test-plan/phase-10-bug-report.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES } from '../../fixtures/test-data';

test.describe('Bug Report Submission', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto(ROUTES.BUG_REPORT);
    await authenticatedPage.getByRole('heading', { name: '버그 제보' }).waitFor({ state: 'visible' });
  });

  test('should display all form elements correctly', async ({ authenticatedPage }) => {
    // 1. Verify "버그 제보" heading is visible
    await expect(authenticatedPage.getByRole('heading', { name: '버그 제보' })).toBeVisible();

    // 2. Verify category label is visible
    await expect(authenticatedPage.getByText('카테고리', { exact: true })).toBeVisible();

    // 3. Verify all three category radio buttons are visible
    await expect(authenticatedPage.getByRole('radio', { name: '버그 제보' })).toBeVisible();
    await expect(authenticatedPage.getByRole('radio', { name: '문의 사항' })).toBeVisible();
    await expect(authenticatedPage.getByRole('radio', { name: '기타' })).toBeVisible();

    // 4. Verify BUG category is checked by default
    await expect(authenticatedPage.getByRole('radio', { name: '버그 제보' })).toBeChecked();

    // 5. Verify title input field is visible
    await expect(authenticatedPage.locator('#title')).toBeVisible();

    // 6. Verify description textarea is visible
    await expect(authenticatedPage.locator('#description')).toBeVisible();

    // 7. Verify submit button is visible
    await expect(authenticatedPage.getByRole('button', { name: '제출하기' })).toBeVisible();
  });

  test('should allow selecting different categories', async ({ authenticatedPage }) => {
    // 1. Verify BUG category is selected by default
    await expect(authenticatedPage.getByRole('radio', { name: '버그 제보' })).toBeChecked();

    // 2. Click INQUIRY category
    await authenticatedPage.getByRole('radio', { name: '문의 사항' }).click();
    await expect(authenticatedPage.getByRole('radio', { name: '문의 사항' })).toBeChecked();

    // 3. Click OTHER category
    await authenticatedPage.getByRole('radio', { name: '기타' }).click();
    await expect(authenticatedPage.getByRole('radio', { name: '기타' })).toBeChecked();

    // 4. Click BUG category again
    await authenticatedPage.getByRole('radio', { name: '버그 제보' }).click();
    await expect(authenticatedPage.getByRole('radio', { name: '버그 제보' })).toBeChecked();
  });

  test('should validate required fields on empty submission', async ({ authenticatedPage }) => {
    // 1. Leave all fields empty
    await expect(authenticatedPage.locator('#title')).toHaveValue('');
    await expect(authenticatedPage.locator('#description')).toHaveValue('');

    // 2. Click submit button
    await authenticatedPage.getByRole('button', { name: '제출하기' }).click();

    // 3. Verify error messages appear
    await expect(authenticatedPage.getByText('제목을 입력해주세요.')).toBeVisible();
    await expect(authenticatedPage.getByText('상세 내용을 입력해주세요.')).toBeVisible();

    // 4. Verify still on bug report page
    await expect(authenticatedPage).toHaveURL(ROUTES.BUG_REPORT);
  });

  test('should validate title field when only description is filled', async ({ authenticatedPage }) => {
    // 1. Fill description field only
    await authenticatedPage.locator('#description').fill('설명만 입력했습니다');

    // 2. Click submit button
    await authenticatedPage.getByRole('button', { name: '제출하기' }).click();

    // 3. Verify title error message appears
    await expect(authenticatedPage.getByText('제목을 입력해주세요.')).toBeVisible();
  });

  test('should validate description field when only title is filled', async ({ authenticatedPage }) => {
    // 1. Fill title field only
    await authenticatedPage.locator('#title').fill('제목만 입력했습니다');

    // 2. Click submit button
    await authenticatedPage.getByRole('button', { name: '제출하기' }).click();

    // 3. Verify description error message appears
    await expect(authenticatedPage.getByText('상세 내용을 입력해주세요.')).toBeVisible();
  });

  test('should successfully submit bug report with valid data', async ({ authenticatedPage }) => {
    // 1. Fill title field
    await authenticatedPage.locator('#title').fill('테스트 버그 리포트');

    // 2. Fill description field
    await authenticatedPage.locator('#description').fill('테스트 설명입니다');

    // 3. Click submit button
    await authenticatedPage.getByRole('button', { name: '제출하기' }).click();

    // 4. Wait for success toast or redirect
    const successToast = authenticatedPage.getByText('버그 제보가 성공적으로 등록되었습니다.');
    await successToast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    // 5. Verify redirect to home page
    await expect(authenticatedPage).toHaveURL(ROUTES.HOME, { timeout: 10000 });
  });
});
