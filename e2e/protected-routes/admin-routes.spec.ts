// spec: e2e-test-plan/phase3-protected-routes.plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/auth.fixture';
import { ROUTES } from '../fixtures/test-data';

test.describe('Phase 3: Protected Routes - Admin Route Authorization Tests', () => {
  test('Regular USER cannot access /admin/bug-reports', async ({ authenticatedPage: page }) => {
    // Already logged in as regular USER via authenticatedPage fixture

    // 2. Navigate to http://localhost:8080/admin/bug-reports
    await page.goto(ROUTES.ADMIN_BUG_REPORTS);

    // 3. Verify redirect to homepage occurs
    await page.waitForURL(ROUTES.HOME);
    await expect(page).toHaveURL(ROUTES.HOME);
    
    // 4. Verify admin content is not displayed
    // The page should show homepage content, not admin panel
    await expect(page.getByText('문의사항 관리')).not.toBeVisible();
    
    // 5. Verify user has USER role in token
    const userRole = await page.evaluate(() => {
      const token = localStorage.getItem('token');
      if (!token) return 'No token';
      
      const parts = token.split('.');
      if (parts.length !== 3) return 'Invalid token';
      
      try {
        const payload = JSON.parse(atob(parts[1]));
        return payload.role || 'No role in token';
      } catch {
        return 'Error decoding token';
      }
    });

    expect(userRole).toBe('USER');
  });

  test('Admin routes not listed in regular user navigation', async ({ authenticatedPage: page }) => {
    // Already logged in as regular USER via authenticatedPage fixture

    // Navigate to a regular page to check navigation
    await page.goto(ROUTES.AGENT);
    await page.getByRole('heading', { name: '메뉴 추천 받기' }).waitFor({ state: 'visible' });
    
    // 2. Check header navigation - verify no admin links in header
    const headerHasAdminLink = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return false;
      
      const headerText = header.textContent || '';
      return headerText.includes('문의사항 관리') || headerText.includes('admin');
    });
    
    expect(headerHasAdminLink).toBe(false);
    
    // 3. Check footer navigation - verify no admin links in footer
    const footerHasAdminLink = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (!footer) return false;
      
      const footerText = footer.textContent || '';
      return footerText.includes('문의사항 관리') || footerText.includes('admin');
    });
    
    expect(footerHasAdminLink).toBe(false);
    
    // 4. Verify admin routes are not discoverable through UI
    // Check that there are no links or buttons that navigate to /admin/bug-reports
    const adminLinksCount = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a, button'));
      return allLinks.filter(el => {
        const href = el.getAttribute('href') || '';
        const onclick = el.getAttribute('onclick') || '';
        const text = el.textContent || '';
        
        return href.includes('/admin') || 
               onclick.includes('/admin') || 
               href.includes('bug-reports') ||
               text.includes('문의사항 관리');
      }).length;
    });
    
    expect(adminLinksCount).toBe(0);
  });

  // Admin account tests using admin@example.com / adminpassword

  test('ADMIN user can access /admin/bug-reports', async ({ adminPage: page }) => {
    // Already logged in as ADMIN via adminPage fixture

    // Close InitialSetupModal if it appears
    const modal = page.getByRole('dialog');
    if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
      const closeButton = modal.getByRole('button', { name: '닫기' });
      if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeButton.click();
      }
    }

    // Navigate to http://localhost:8080/admin/bug-reports
    await page.goto(ROUTES.ADMIN_BUG_REPORTS);

    // 3. Verify URL remains http://localhost:8080/admin/bug-reports
    await expect(page).toHaveURL(ROUTES.ADMIN_BUG_REPORTS);

    // 4. Verify admin bug report list page is displayed
    // Check for admin page indicators
    await expect(page.getByText('문의사항 관리').first()).toBeVisible();

    // 5. Verify user has ADMIN role in token
    const userRole = await page.evaluate(() => {
      const token = localStorage.getItem('token');
      if (!token) return 'No token';

      const parts = token.split('.');
      if (parts.length !== 3) return 'Invalid token';

      try {
        const payload = JSON.parse(atob(parts[1]));
        return payload.role || 'No role in token';
      } catch {
        return 'Error decoding token';
      }
    });

    expect(userRole).toBe('ADMIN');
  });

  test('ADMIN role persists in token after page refresh', async ({ adminPage: page }) => {
    // Already logged in as ADMIN via adminPage fixture

    // Close InitialSetupModal if it appears
    const modal = page.getByRole('dialog');
    if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
      const closeButton = modal.getByRole('button', { name: '닫기' });
      if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeButton.click();
      }
    }

    // Navigate to /admin/bug-reports
    await page.goto(ROUTES.ADMIN_BUG_REPORTS);

    // 3. Verify admin page loads
    await expect(page).toHaveURL(ROUTES.ADMIN_BUG_REPORTS);

    // 4. Refresh the page
    await page.reload();

    // 5. Verify URL is still /admin/bug-reports
    await expect(page).toHaveURL(ROUTES.ADMIN_BUG_REPORTS);

    // 6. Verify admin content is still accessible
    await expect(page.getByText('문의사항 관리').first()).toBeVisible();

    // Verify token still has ADMIN role
    const userRole = await page.evaluate(() => {
      const token = localStorage.getItem('token');
      if (!token) return 'No token';

      const parts = token.split('.');
      if (parts.length !== 3) return 'Invalid token';

      try {
        const payload = JSON.parse(atob(parts[1]));
        return payload.role || 'No role in token';
      } catch {
        return 'Error decoding token';
      }
    });

    expect(userRole).toBe('ADMIN');
  });

  // NOTE: This test is marked as fixme because the UserMenu component is NOT used in AppHeader.tsx
  // The header only displays a static "<span>{userName}님</span>" without a dropdown menu.
  // To enable this test, AppHeader.tsx needs to import and render the UserMenu component.
  // See: src/components/common/AppHeader.tsx line 57-59
  // See: src/components/common/UserMenu.tsx (exists but not used)
  test.fixme('Admin routes listed in admin user navigation', async ({ adminPage: page }) => {
    // Already logged in as ADMIN via adminPage fixture

    // Close InitialSetupModal if it appears by pressing Escape
    await page.keyboard.press('Escape');

    // Open user menu dropdown - click on the button that contains the user's name
    // The UserMenu component renders a button with "~님" text and a hamburger icon
    const userMenuButton = page.getByRole('button', { name: /관리자님|님/ });
    await userMenuButton.click();

    // 3. Verify '문의사항 관리' button is visible in the dropdown (it's a button, not menuitem)
    const adminMenuItem = page.getByRole('button', { name: '문의사항 관리' });
    await expect(adminMenuItem).toBeVisible();

    // 4. Click admin link
    await adminMenuItem.click();

    // 5. Verify navigation to /admin/bug-reports succeeds
    await expect(page).toHaveURL(ROUTES.ADMIN_BUG_REPORTS);
    await expect(page.getByText('문의사항 관리').first()).toBeVisible();
  });
});
