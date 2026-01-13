import { test, expect } from '../fixtures/auth.fixture';
import { ROUTES } from '../fixtures/test-data';

test.describe('Protected Routes - Token Management Tests', () => {
  test('Valid token in localStorage allows access to /agent', async ({ authenticatedPage: page }) => {
    // Already logged in via authenticatedPage fixture

    // Close initial setup modal
    await page.keyboard.press('Escape');

    // Navigate to http://localhost:8080/agent
    await page.goto(ROUTES.AGENT);
    
    // Wait for page to fully load
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });
    
    // 3. Verify URL remains http://localhost:8080/agent (no redirect)
    await expect(page).toHaveURL(ROUTES.AGENT);
    
    // 4. Verify agent page content is displayed
    await expect(page.getByRole('heading', { name: '메뉴 추천 받기' })).toBeVisible();
  });

  test('Token stored in localStorage after successful login', async ({ authenticatedPage: page }) => {
    // Already logged in via authenticatedPage fixture

    // Check localStorage for 'token' key
    const token = await page.locator('body').evaluate(() => localStorage.getItem('token'));
    
    // 6. Verify token value is a non-empty string
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    
    // 7. Verify token has JWT format (three parts separated by dots)
    const parts = token!.split('.');
    expect(parts).toHaveLength(3);
  });

  test('Token removed from localStorage after logout', async ({ authenticatedPage: page }) => {
    // Already logged in via authenticatedPage fixture

    // Close initial setup modal
    await page.keyboard.press('Escape');

    // Verify token exists in localStorage
    const tokenBefore = await page.locator('body').evaluate(() => localStorage.getItem('token'));
    expect(tokenBefore).toBeTruthy();
    
    // 3. Navigate to a protected route (e.g., /mypage)
    await page.goto(ROUTES.MYPAGE);
    
    // Wait for page to load
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });
    
    // 5. Click '로그아웃' button
    await page.getByRole('button', { name: '로그아웃' }).click();
    
    // 7. Verify URL redirects to homepage or login
    await expect(page).toHaveURL(ROUTES.LOGIN);
    
    // 8. Check localStorage for 'token' key
    const tokenAfter = await page.locator('body').evaluate(() => localStorage.getItem('token'));
    
    // 9. Verify token is null or removed
    expect(tokenAfter).toBeNull();
  });

  test('Expired token redirects to login', async ({ page }) => {
    // 1. Set expired JWT token in localStorage (exp timestamp in past)
    await page.goto(ROUTES.LOGIN);
    await page.locator('body').evaluate(() => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.fakeSignatureForExpiredToken123456789';
      localStorage.setItem('token', expiredToken);
    });
    
    // 2. Navigate to http://localhost:8080/agent
    await page.goto(ROUTES.AGENT);
    
    // Wait for potential redirect
    await page.waitForURL(ROUTES.LOGIN, { timeout: 5000 });

    // 3. Verify redirect to http://localhost:8080/login occurs
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });

  test('Invalid token format redirects to login', async ({ page }) => {
    // 1. Set invalid token string in localStorage (e.g., 'invalid-token-123')
    await page.goto(ROUTES.LOGIN);
    await page.locator('body').evaluate(() => {
      localStorage.setItem('token', 'invalid-token-123');
    });
    
    // 2. Navigate to http://localhost:8080/mypage
    await page.goto(ROUTES.MYPAGE);
    
    // Wait for potential redirect
    await page.waitForURL(/\/login$/, { timeout: 5000 });

    // 3. Verify redirect to /login
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Token persists across page refreshes', async ({ authenticatedPage: page }) => {
    // Already logged in via authenticatedPage fixture

    // Close initial setup modal
    await page.keyboard.press('Escape');

    // Navigate to http://localhost:8080/agent
    await page.goto(ROUTES.AGENT);
    
    // 3. Verify agent page is accessible - Wait for page to load
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });
    
    // Store token before refresh
    const tokenBeforeRefresh = await page.locator('body').evaluate(() => localStorage.getItem('token'));
    expect(tokenBeforeRefresh).toBeTruthy();
    
    // 4. Refresh the page (page.reload())
    await page.reload();
    
    // 5. Wait for page to reload
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });
    
    // 6. Verify token still exists in localStorage
    const tokenAfterRefresh = await page.locator('body').evaluate(() => localStorage.getItem('token'));
    expect(tokenAfterRefresh).toBeTruthy();
    expect(tokenAfterRefresh).toBe(tokenBeforeRefresh);
    
    // 7. Verify URL is still /agent
    await expect(page).toHaveURL(/\/agent$/);
    
    // 8. Verify user remains authenticated
    await expect(page.getByText('테스트유저님')).toBeVisible();
  });

  test('Multiple protected routes accessible with single token', async ({ authenticatedPage: page }) => {
    // Already logged in via authenticatedPage fixture

    // Close initial setup modal
    await page.keyboard.press('Escape');

    // Verify token in localStorage
    const initialToken = await page.locator('body').evaluate(() => localStorage.getItem('token'));
    expect(initialToken).toBeTruthy();
    
    // 3. Navigate to http://localhost:8080/agent
    await page.goto(ROUTES.AGENT);
    
    // Wait for page to load
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });
    
    // 4. Verify agent page loads
    await expect(page.getByRole('heading', { name: '메뉴 추천 받기' })).toBeVisible();
    
    // 5. Navigate to http://localhost:8080/map
    await page.goto(ROUTES.MAP);
    
    // 6. Verify map page loads (test user has address, so map shows)
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });
    await expect(page.getByText('네이버 지도')).toBeVisible();
    
    // 7. Navigate to http://localhost:8080/mypage
    await page.goto(ROUTES.MYPAGE);
    
    // 8. Verify mypage loads
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });
    await expect(page.getByRole('heading', { name: '마이페이지' })).toBeVisible();
    
    // 9. Navigate to http://localhost:8080/recommendations/history
    await page.goto(ROUTES.RECOMMENDATIONS_HISTORY);
    
    // 10. Verify history page loads
    await page.getByText("페이지를 불러오는 중...").first().waitFor({ state: 'hidden' });
    await expect(page.getByRole('heading', { name: '추천 이력' })).toBeVisible();
    
    // 11. Check localStorage.token remains unchanged throughout
    const finalToken = await page.locator('body').evaluate(() => localStorage.getItem('token'));
    expect(finalToken).toBe(initialToken);
  });
});
