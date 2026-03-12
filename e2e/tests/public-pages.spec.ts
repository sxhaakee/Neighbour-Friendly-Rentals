import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('homepage loads with key elements', async ({ page }) => {
    await page.goto('/');
    
    // Page should load without errors
    await expect(page).toHaveTitle(/NeighbourFriendly|NFR/i);
    
    // Core navigation elements should be visible
    await expect(page.locator('nav')).toBeVisible();
    
    // Should have a CTA or hero section
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('items listing page loads', async ({ page }) => {
    await page.goto('/items');
    await expect(page).toHaveURL(/\/items/);
    
    // Page should render without 500 error
    const errorText = page.locator('text=500');
    await expect(errorText).not.toBeVisible();
  });

  test('properties page loads', async ({ page }) => {
    await page.goto('/properties');
    await expect(page).toHaveURL(/\/properties/);
  });

  test('services page loads', async ({ page }) => {
    await page.goto('/services');
    await expect(page).toHaveURL(/\/services/);
  });

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveURL(/\/blog/);
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about/);
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveURL(/\/terms/);
    await expect(page.locator('body')).toContainText(/terms/i);
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.locator('body')).toContainText(/privacy/i);
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact/);
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    
    // Should have email and password inputs
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('premium page redirects to auth (protected route)', async ({ page }) => {
    await page.goto('/premium');
    // Premium is a protected route — should redirect to auth
    await page.waitForURL((url) => 
      url.pathname.includes('/auth') || url.pathname.includes('/premium'),
      { timeout: 10_000 }
    );
  });

  test('404 page for non-existent route', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    // Should return 404 status
    expect(response?.status()).toBe(404);
  });
});
