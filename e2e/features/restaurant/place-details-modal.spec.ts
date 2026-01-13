// spec: PlaceDetailsModal E2E Tests
// seed: e2e/seed.spec.ts

import { test, expect } from '../../fixtures/auth.fixture';
import { ROUTES, TIMEOUTS, EXPECTED_MOCK_RESPONSES } from '../../fixtures/test-data';

/**
 * PlaceDetailsModal E2E Tests
 *
 * Tests the restaurant details modal functionality including:
 * - Opening and closing the modal
 * - Displaying restaurant information
 * - Photo slideshow navigation (when multiple photos available)
 * - Reviews and blog sections
 *
 * Prerequisites:
 * - User must be authenticated
 * - Backend E2E_MOCK=true mode for consistent responses
 */
test.describe('Place Details Modal', () => {
  // Increase timeout for all tests in this describe block due to AI recommendations and animations
  test.setTimeout(60000);

  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to Agent page
    await authenticatedPage.goto(ROUTES.AGENT);
    await authenticatedPage.getByText('메뉴 추천 받기').first().waitFor({ state: 'visible' });

    // Get menu recommendations
    await authenticatedPage.getByRole('textbox', { name: '어떤 메뉴를 원하시나요?' }).fill('배가 고픈데 뭐 먹을까?');
    await authenticatedPage.getByRole('button', { name: '메뉴 추천 받기' }).click();
    await authenticatedPage.getByRole('heading', { name: '추천 메뉴' }).waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

    // Select first menu and click AI recommendation
    const firstMenuCard = authenticatedPage.getByRole('button').filter({ hasText: /^1/ }).first();
    await firstMenuCard.click();
    await authenticatedPage.getByRole('button', { name: 'AI 추천 보기' }).click();

    // Wait for AI recommendations to load
    await authenticatedPage.getByText(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName).waitFor({
      state: 'visible',
      timeout: TIMEOUTS.LONG
    });
  });

  test('should open modal when clicking restaurant card', async ({ authenticatedPage }) => {
    // 1. Click on restaurant card
    await authenticatedPage.getByRole('button', {
      name: new RegExp(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)
    }).click();

    // 2. Verify modal is visible
    await expect(authenticatedPage.getByRole('heading', {
      name: EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName,
      level: 3
    })).toBeVisible();

    // 3. Verify restaurant information is displayed
    await expect(authenticatedPage.getByText(/평점.*리뷰.*개/)).toBeVisible();
  });

  test('should close modal with ESC key', async ({ authenticatedPage }) => {
    // 1. Open modal
    await authenticatedPage.getByRole('button', {
      name: new RegExp(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)
    }).click();

    // 2. Verify modal is open and fully rendered with content
    const modalHeading = authenticatedPage.getByRole('heading', {
      name: EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName,
      level: 3
    });
    await expect(modalHeading).toBeVisible();

    // Wait for modal content to be fully loaded (photo section indicates ready state)
    await expect(authenticatedPage.getByRole('heading', { name: '사진', level: 4 })).toBeVisible();

    // 3. Press ESC key
    await authenticatedPage.keyboard.press('Escape');

    // 4. Verify modal is closed
    await expect(modalHeading).not.toBeVisible({ timeout: 3000 });
  });

  test('should close modal with X button', async ({ authenticatedPage }) => {
    // 1. Open modal
    await authenticatedPage.getByRole('button', {
      name: new RegExp(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)
    }).click();

    // 2. Verify modal is open and fully rendered with content
    const modalHeading = authenticatedPage.getByRole('heading', {
      name: EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName,
      level: 3
    });
    await expect(modalHeading).toBeVisible();

    // Wait for modal content to be fully loaded (photo section indicates ready state)
    await expect(authenticatedPage.getByRole('heading', { name: '사진', level: 4 })).toBeVisible();

    // 3. Click close button
    await authenticatedPage.getByRole('button', { name: '닫기' }).click();

    // 4. Verify modal is closed
    await expect(modalHeading).not.toBeVisible({ timeout: 3000 });
  });

  test('should display restaurant details sections', async ({ authenticatedPage }) => {
    // 1. Open modal
    await authenticatedPage.getByRole('button', {
      name: new RegExp(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)
    }).click();

    // 2. Verify restaurant name and rating
    await expect(authenticatedPage.getByRole('heading', {
      name: EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName,
      level: 3
    })).toBeVisible();
    await expect(authenticatedPage.getByText(/평점.*리뷰.*개/)).toBeVisible();

    // 3. Verify photo section is present
    await expect(authenticatedPage.getByRole('heading', { name: '사진', level: 4 })).toBeVisible();

    // 4. Verify location section
    await expect(authenticatedPage.getByRole('heading', { name: '위치 정보', level: 4 })).toBeVisible();

    // 5. Verify reviews section (if available)
    const reviewsHeading = authenticatedPage.getByRole('heading', { name: '리뷰', level: 4, exact: true });
    if (await reviewsHeading.isVisible()) {
      await expect(reviewsHeading).toBeVisible();
    }

    // 6. Verify blog section
    await expect(authenticatedPage.getByRole('heading', { name: /추가 탐색.*블로그/, level: 4 })).toBeVisible();
  });

  test('should display photo counter when photos available', async ({ authenticatedPage }) => {
    // 1. Open modal
    await authenticatedPage.getByRole('button', {
      name: new RegExp(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)
    }).click();

    // 2. Verify photo counter is displayed (format: "1 / 1" or "1 / 2" etc.)
    await expect(authenticatedPage.getByText(/\d+ \/ \d+/)).toBeVisible();
  });

  test('should display reviews when available', async ({ authenticatedPage }) => {
    // 1. Open modal
    await authenticatedPage.getByRole('button', {
      name: new RegExp(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)
    }).click();

    // 2. Check if reviews section exists
    const reviewsHeading = authenticatedPage.getByRole('heading', { name: '리뷰', level: 4, exact: true });

    if (await reviewsHeading.isVisible()) {
      // 3. Verify review content is visible (rating, date, text)
      await expect(authenticatedPage.getByText(/★ \d+\.\d+/)).toBeVisible();
    }
  });

  test('should display blog posts in additional section', async ({ authenticatedPage }) => {
    // 1. Open modal
    await authenticatedPage.getByRole('button', {
      name: new RegExp(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)
    }).click();

    // 2. Verify blog section heading
    await expect(authenticatedPage.getByRole('heading', {
      name: /추가 탐색.*블로그/,
      level: 4
    })).toBeVisible();

    // 3. Verify at least one blog link is present
    const blogLinks = authenticatedPage.getByRole('link').filter({ hasText: /./ });
    await expect(blogLinks.first()).toBeVisible();
  });

  test('should keep modal content scrollable', async ({ authenticatedPage }) => {
    // 1. Open modal
    await authenticatedPage.getByRole('button', {
      name: new RegExp(EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName)
    }).click();

    // 2. Verify modal is visible
    await expect(authenticatedPage.getByRole('heading', {
      name: EXPECTED_MOCK_RESPONSES.AI_PLACES.firstRestaurantName,
      level: 3
    })).toBeVisible();

    // 3. Try scrolling to blog section (at bottom)
    const blogSection = authenticatedPage.getByRole('heading', {
      name: /추가 탐색.*블로그/,
      level: 4
    });
    await blogSection.scrollIntoViewIfNeeded();

    // 4. Verify blog section is now visible after scroll
    await expect(blogSection).toBeVisible();
  });
});
