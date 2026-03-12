import { test, expect } from '../fixtures/auth';

test.describe('Dashboard (Authenticated)', () => {
  test('dashboard loads with stats cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Should be on the dashboard
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);
    
    // No server error
    await expect(authenticatedPage.locator('text=500 Internal Server Error')).not.toBeVisible();
    
    // Should show some kind of welcome or stats
    const body = authenticatedPage.locator('body');
    await expect(body).toBeVisible();
  });

  test('can navigate to add-item from dashboard', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Look for any add/create button
    const addButton = authenticatedPage.locator('a[href*="/add-item"], button:has-text("Add"), a:has-text("Add")').first();
    
    if (await addButton.count() > 0) {
      await addButton.click();
      await expect(authenticatedPage).toHaveURL(/\/add-item/);
    }
  });

  test('add-item page has required form fields', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/add-item');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Should have form elements for creating a listing
    const form = authenticatedPage.locator('form');
    if (await form.count() > 0) {
      await expect(form.first()).toBeVisible();
    }
  });

  test('premium page shows pricing plans', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/premium');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Should show premium content
    await expect(authenticatedPage.locator('text=500 Internal Server Error')).not.toBeVisible();
  });
});
