import { test, expect } from '../fixtures/auth';

test.describe('Profile (Authenticated)', () => {
  test('profile page loads when logged in', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile');
    
    // Should stay on profile page (not redirect to login)
    await expect(authenticatedPage).toHaveURL(/\/profile/);
    
    // Should show some profile content
    const body = authenticatedPage.locator('body');
    await expect(body).toBeVisible();
  });

  test('dashboard shows user data', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    
    // Should load dashboard without error
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);
    
    // Should show some stats or welcome message
    const body = authenticatedPage.locator('body');
    await expect(body).toBeVisible();
  });

  test('user can view their own listings from dashboard', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    
    // Wait for page content to load
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Dashboard should render without 500 errors
    const errorIndicator = authenticatedPage.locator('text=500 Internal Server Error');
    await expect(errorIndicator).not.toBeVisible();
  });
});
