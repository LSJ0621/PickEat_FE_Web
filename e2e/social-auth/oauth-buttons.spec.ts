import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('OAuth Button Display', () => {
  test('Display Kakao Login Button', async ({ page }) => {
    // 1. Navigate to login page (/login)
    await page.goto(ROUTES.LOGIN);
    
    // 2. Verify Kakao login button
    await page.getByText('카카오로 계속하기').first().waitFor({ state: 'visible' });
    await expect(page.getByRole('button', { name: '카카오로 계속하기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '카카오로 계속하기' })).toBeEnabled();
  });

  test('Display Google Login Button', async ({ page }) => {
    // 1. Navigate to login page (/login)
    await page.goto(ROUTES.LOGIN);
    
    // 2. Verify Google login button
    await page.getByText('Google로 계속하기').first().waitFor({ state: 'visible' });
    await expect(page.getByRole('button', { name: 'Google로 계속하기' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Google로 계속하기' })).toBeEnabled();
  });

  test('Verify Both OAuth Buttons Displayed Together', async ({ page }) => {
    // 1. Navigate to login page (/login)
    await page.goto(ROUTES.LOGIN);
    
    // 2. Verify both buttons
    await page.getByText('카카오로 계속하기').first().waitFor({ state: 'visible' });
    
    const kakaoButton = page.getByRole('button', { name: '카카오로 계속하기' });
    const googleButton = page.getByRole('button', { name: 'Google로 계속하기' });
    
    await expect(kakaoButton).toBeVisible();
    await expect(googleButton).toBeVisible();
    await expect(kakaoButton).toBeEnabled();
    await expect(googleButton).toBeEnabled();
  });
});
