/**
 * E2E Tests for i18n (Internationalization) - Language Switching Functionality
 *
 * Tests cover:
 * 1. Unauthenticated user language switching
 * 2. Language persistence across page reloads
 * 3. Language consistency across multiple pages
 * 4. LocalStorage synchronization
 *
 * Note: Tests focus on UI language switching functionality.
 * Authentication and API error message tests require backend to be running.
 */

import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Scenario 1: Unauthenticated User Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and set to Korean to ensure consistent starting state
    await page.goto(ROUTES.HOME);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('i18nextLng', 'ko');
    });
    await page.reload();
    // Wait for language to be applied
    await page.waitForTimeout(1000);
  });

  test('should switch from Korean to English and persist after reload', async ({ page }) => {
    // 1. Start on home page where LanguageSelector is visible
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(1000);

    // 2. Verify language selector is visible on home page
    const koreanLangButton = page.getByRole('button', { name: 'Switch to Korean' });
    const englishLangButton = page.getByRole('button', { name: 'Switch to English' });

    await expect(koreanLangButton).toBeVisible();
    await expect(englishLangButton).toBeVisible();

    // 3. Verify initial state is Korean
    await expect(koreanLangButton).toHaveAttribute('aria-pressed', 'true');
    await expect(englishLangButton).toHaveAttribute('aria-pressed', 'false');

    // 4. Navigate to login page to check Korean UI
    await page.goto(ROUTES.LOGIN);
    await page.waitForTimeout(1000);
    const koreanLoginButton = page.getByRole('button', { name: '로그인' }).first();
    await expect(koreanLoginButton).toBeVisible();

    // 5. Go back to home and switch to English
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);
    await englishLangButton.click();
    await page.waitForTimeout(1000);

    // 6. Verify English button is now active
    await expect(englishLangButton).toHaveAttribute('aria-pressed', 'true');
    await expect(koreanLangButton).toHaveAttribute('aria-pressed', 'false');

    // 7. Navigate to login page to verify English UI
    await page.goto(ROUTES.LOGIN);
    await page.waitForTimeout(1000);
    const englishLoginButton = page.getByRole('button', { name: /login/i }).first();
    await expect(englishLoginButton).toBeVisible();

    // 8. Verify localStorage contains 'en'
    const storedLanguage = await page.evaluate(() => {
      return localStorage.getItem('i18nextLng');
    });
    expect(storedLanguage).toBe('en');

    // 9. Reload page and verify persistence
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(englishLoginButton).toBeVisible();

    // 10. Go to home page and check language selector
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);
    await expect(englishLangButton).toHaveAttribute('aria-pressed', 'true');

    // 11. Verify localStorage still contains 'en'
    const storedLanguageAfterReload = await page.evaluate(() => {
      return localStorage.getItem('i18nextLng');
    });
    expect(storedLanguageAfterReload).toBe('en');
  });

  test('should switch from English to Korean', async ({ page }) => {
    // 1. Set initial language to English
    await page.goto(ROUTES.HOME);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('i18nextLng', 'en');
    });
    await page.reload();
    await page.waitForTimeout(1000);

    // 2. Verify English is active
    const englishLangButton = page.getByRole('button', { name: 'Switch to English' });
    await expect(englishLangButton).toHaveAttribute('aria-pressed', 'true');

    // 3. Navigate to login page and verify English UI
    await page.goto(ROUTES.LOGIN);
    await page.waitForTimeout(1000);
    const englishLoginButton = page.getByRole('button', { name: /login/i }).first();
    await expect(englishLoginButton).toBeVisible();

    // 4. Go back to home and click Korean button
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);
    const koreanLangButton = page.getByRole('button', { name: 'Switch to Korean' });
    await koreanLangButton.click();
    await page.waitForTimeout(1000);

    // 5. Verify Korean button is now active
    await expect(koreanLangButton).toHaveAttribute('aria-pressed', 'true');
    await expect(englishLangButton).toHaveAttribute('aria-pressed', 'false');

    // 6. Navigate to login page and verify Korean UI
    await page.goto(ROUTES.LOGIN);
    await page.waitForTimeout(1000);
    const koreanLoginButton = page.getByRole('button', { name: '로그인' }).first();
    await expect(koreanLoginButton).toBeVisible();

    // 7. Verify localStorage contains 'ko'
    const storedLanguage = await page.evaluate(() => {
      return localStorage.getItem('i18nextLng');
    });
    expect(storedLanguage).toBe('ko');
  });
});

test.describe('Scenario 2: Language Consistency Across Multiple Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and set to Korean
    await page.goto(ROUTES.HOME);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('i18nextLng', 'ko');
    });
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('should maintain English across multiple pages', async ({ page }) => {
    // 1. Start on home page where LanguageSelector is visible
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);

    // 2. Switch to English
    const englishLangButton = page.getByRole('button', { name: 'Switch to English' });
    await englishLangButton.click();
    await page.waitForTimeout(1000);

    // 3. Verify English is active
    await expect(englishLangButton).toHaveAttribute('aria-pressed', 'true');

    // 4. Navigate to login page (auth page without LanguageSelector)
    await page.goto(ROUTES.LOGIN);
    await page.waitForTimeout(1000);

    // 5. Verify UI elements are in English on login page
    const loginButton = page.getByRole('button', { name: /login/i }).first();
    await expect(loginButton).toBeVisible();

    // 6. Navigate to register page
    await page.goto(ROUTES.REGISTER);
    await page.waitForTimeout(1000);

    // 7. Verify UI elements are in English on register page
    const signUpButton = page.getByRole('button', { name: /sign up/i }).first();
    await expect(signUpButton).toBeVisible();

    // 8. Go back to home page to verify language selector state
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);
    const englishLangButtonOnHome = page.getByRole('button', { name: 'Switch to English' });
    await expect(englishLangButtonOnHome).toHaveAttribute('aria-pressed', 'true');
  });

  test('should maintain Korean across multiple pages', async ({ page }) => {
    // 1. Start on home page with Korean (default from beforeEach)
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);

    // 2. Verify Korean is active
    const koreanLangButton = page.getByRole('button', { name: 'Switch to Korean' });
    await expect(koreanLangButton).toHaveAttribute('aria-pressed', 'true');

    // 3. Navigate to login page
    await page.goto(ROUTES.LOGIN);
    await page.waitForTimeout(1000);

    // 4. Verify UI elements are in Korean on login page
    const loginButton = page.getByRole('button', { name: '로그인' }).first();
    await expect(loginButton).toBeVisible();

    // 5. Navigate to register page
    await page.goto(ROUTES.REGISTER);
    await page.waitForTimeout(1000);

    // 6. Verify UI elements are in Korean on register page
    const registerButton = page.getByRole('button', { name: '회원가입' }).first();
    await expect(registerButton).toBeVisible();

    // 7. Go back to home page to verify language selector state
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);
    const koreanLangButtonOnHome = page.getByRole('button', { name: 'Switch to Korean' });
    await expect(koreanLangButtonOnHome).toHaveAttribute('aria-pressed', 'true');
  });

  test('should persist language when navigating forward and backward', async ({ page }) => {
    // 1. Start on home page and switch to English
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);

    const englishLangButton = page.getByRole('button', { name: 'Switch to English' });
    await englishLangButton.click();
    await page.waitForTimeout(1000);

    // 2. Navigate to login page
    await page.goto(ROUTES.LOGIN);
    await page.waitForTimeout(1000);

    // 3. Verify English UI on login page
    const loginButton = page.getByRole('button', { name: /login/i }).first();
    await expect(loginButton).toBeVisible();

    // 4. Go back to home page
    await page.goBack();
    await page.waitForTimeout(1000);

    // 5. Verify English is still active on home page
    const englishLangButtonOnHome = page.getByRole('button', { name: 'Switch to English' });
    await expect(englishLangButtonOnHome).toHaveAttribute('aria-pressed', 'true');

    // 6. Go forward to login page again
    await page.goForward();
    await page.waitForTimeout(1000);

    // 7. Verify English UI is maintained
    const loginButtonAgain = page.getByRole('button', { name: /login/i }).first();
    await expect(loginButtonAgain).toBeVisible();
  });
});

test.describe('Scenario 3: Language Switching on Different Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.HOME);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('i18nextLng', 'ko');
    });
    await page.reload();
    await page.waitForTimeout(1000);
  });

  test('should switch language and see changes across pages', async ({ page }) => {
    // 1. Start on home page with Korean
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);

    const koreanLangButton = page.getByRole('button', { name: 'Switch to Korean' });
    await expect(koreanLangButton).toHaveAttribute('aria-pressed', 'true');

    // 2. Go to login page and verify Korean text
    await page.goto(ROUTES.LOGIN);
    await page.waitForTimeout(1000);

    const koreanLogin = page.getByRole('button', { name: '로그인' }).first();
    const koreanRegister = page.getByText('회원가입');
    const koreanPasswordReset = page.getByText('재설정하기');

    await expect(koreanLogin).toBeVisible();
    await expect(koreanRegister).toBeVisible();
    await expect(koreanPasswordReset).toBeVisible();

    // 3. Go back to home and switch to English
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);

    const englishLangButton = page.getByRole('button', { name: 'Switch to English' });
    await englishLangButton.click();
    await page.waitForTimeout(1000);

    // 4. Go to login page and verify English text
    await page.goto(ROUTES.LOGIN);
    await page.waitForTimeout(1000);

    const englishLogin = page.getByRole('button', { name: /login/i }).first();
    const englishRegister = page.getByText(/sign up/i);
    const englishReset = page.getByText(/reset/i);

    await expect(englishLogin).toBeVisible();
    await expect(englishRegister).toBeVisible();
    await expect(englishReset).toBeVisible();
  });

  test('should switch language and verify on register page', async ({ page }) => {
    // 1. Start on home page with Korean
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);

    // 2. Go to register page and verify Korean text
    await page.goto(ROUTES.REGISTER);
    await page.waitForTimeout(1000);

    const koreanRegister = page.getByRole('button', { name: '회원가입' }).first();
    const koreanLogin = page.getByText('로그인');

    await expect(koreanRegister).toBeVisible();
    await expect(koreanLogin).toBeVisible();

    // 3. Go back to home and switch to English
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);

    const englishLangButton = page.getByRole('button', { name: 'Switch to English' });
    await englishLangButton.click();
    await page.waitForTimeout(1000);

    // 4. Go to register page and verify English text
    await page.goto(ROUTES.REGISTER);
    await page.waitForTimeout(1000);

    const englishSignUp = page.getByRole('button', { name: /sign up/i }).first();
    const englishLogin = page.getByText(/login/i);

    await expect(englishSignUp).toBeVisible();
    await expect(englishLogin).toBeVisible();
  });
});

test.describe('Scenario 4: LocalStorage Synchronization', () => {
  test('should correctly update localStorage on language change', async ({ page }) => {
    // Start with cleared localStorage on home page
    await page.goto(ROUTES.HOME);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(1000);

    // Check initial language (should be browser default or fallback to 'ko')
    let currentLang = await page.evaluate(() => localStorage.getItem('i18nextLng'));
    expect(currentLang).toBeTruthy();

    // Switch to Korean explicitly
    const koreanLangButton = page.getByRole('button', { name: 'Switch to Korean' });
    await koreanLangButton.click();
    await page.waitForTimeout(1000);

    // Verify localStorage
    currentLang = await page.evaluate(() => localStorage.getItem('i18nextLng'));
    expect(currentLang).toBe('ko');

    // Switch to English
    const englishLangButton = page.getByRole('button', { name: 'Switch to English' });
    await englishLangButton.click();
    await page.waitForTimeout(1000);

    // Verify localStorage
    currentLang = await page.evaluate(() => localStorage.getItem('i18nextLng'));
    expect(currentLang).toBe('en');

    // Switch back to Korean
    await koreanLangButton.click();
    await page.waitForTimeout(1000);

    // Verify localStorage
    currentLang = await page.evaluate(() => localStorage.getItem('i18nextLng'));
    expect(currentLang).toBe('ko');
  });

  test('should respect pre-set localStorage language on page load', async ({ page }) => {
    // Pre-set English in localStorage
    await page.goto(ROUTES.HOME);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('i18nextLng', 'en');
    });
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify English is loaded on home page
    const englishLangButton = page.getByRole('button', { name: 'Switch to English' });
    await expect(englishLangButton).toHaveAttribute('aria-pressed', 'true');

    // Navigate to login page
    await page.goto(ROUTES.LOGIN);
    await page.waitForTimeout(1000);

    const englishLogin = page.getByRole('button', { name: /login/i }).first();
    await expect(englishLogin).toBeVisible();

    // Navigate to register page
    await page.goto(ROUTES.REGISTER);
    await page.waitForTimeout(1000);

    const englishSignUp = page.getByRole('button', { name: /sign up/i }).first();
    await expect(englishSignUp).toBeVisible();

    // Go back to home page and verify language selector still shows English
    await page.goto(ROUTES.HOME);
    await page.waitForTimeout(500);
    await expect(englishLangButton).toHaveAttribute('aria-pressed', 'true');
  });
});
