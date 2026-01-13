import { test, expect } from '@playwright/test';
import { ROUTES } from './fixtures/test-data';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    await expect(page).toHaveTitle('pickeat_web');
  });
});
