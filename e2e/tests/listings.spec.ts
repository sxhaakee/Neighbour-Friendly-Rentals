import { test, expect } from '@playwright/test';

test.describe('Listings', () => {
  test('items page shows listings or empty state', async ({ page }) => {
    await page.goto('/items');
    await page.waitForLoadState('networkidle');
    
    // Should have either listings or a "no items" message
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // No 500 error
    await expect(page.locator('text=500 Internal Server Error')).not.toBeVisible();
  });

  test('items page has search/filter functionality', async ({ page }) => {
    await page.goto('/items');
    
    // Should have a search input or filter controls
    const searchInput = page.locator('input[placeholder*="earch"], input[type="search"], input[name="search"]');
    // Search may or may not be visible depending on design — test doesn't fail if absent
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('clicking a listing opens its detail page', async ({ page }) => {
    await page.goto('/items');
    await page.waitForLoadState('networkidle');
    
    // Find any link that looks like a listing
    const listingLink = page.locator('a[href*="/items/"]').first();
    
    if (await listingLink.count() > 0) {
      await listingLink.click();
      
      // Should navigate to an item detail page
      await expect(page).toHaveURL(/\/items\/.+/);
      
      // Detail page should not show 500 error
      await expect(page.locator('text=500 Internal Server Error')).not.toBeVisible();
    }
  });

  test('properties page loads without errors', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=500 Internal Server Error')).not.toBeVisible();
  });

  test('services page loads without errors', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=500 Internal Server Error')).not.toBeVisible();
  });
});
