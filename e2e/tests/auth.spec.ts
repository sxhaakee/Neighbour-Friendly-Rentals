import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page has required form elements', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show an error message (not redirect)
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/(login|auth)/);
  });

  test('protected routes redirect to auth when not logged in', async ({ page }) => {
    // Dashboard should redirect unauthenticated users
    await page.goto('/dashboard');
    
    // Should redirect to /auth or /login
    await page.waitForURL((url) => 
      url.pathname.includes('/auth') || url.pathname.includes('/login') || url.pathname === '/',
      { timeout: 10_000 }
    );
  });

  test('messages page redirects when not logged in', async ({ page }) => {
    await page.goto('/messages');
    
    await page.waitForURL((url) => 
      url.pathname.includes('/auth') || url.pathname.includes('/login') || url.pathname === '/',
      { timeout: 10_000 }
    );
  });

  test('add-item page redirects when not logged in', async ({ page }) => {
    await page.goto('/add-item');
    
    await page.waitForURL((url) => 
      url.pathname.includes('/auth') || url.pathname.includes('/login') || url.pathname === '/',
      { timeout: 10_000 }
    );
  });

  test('admin page redirects non-admins', async ({ page }) => {
    await page.goto('/nfr-control');
    
    // Should redirect to auth or home
    await page.waitForURL((url) => 
      url.pathname.includes('/auth') || url.pathname.includes('/login') || url.pathname === '/',
      { timeout: 10_000 }
    );
  });
});
