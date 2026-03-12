import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage and display main elements', async ({ page }) => {
    // Navigate to the local development environment or production URL
    // You can set PLAYWRIGHT_TEST_BASE_URL environment variable to override
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
    await page.goto(baseURL);

    // Check if the title is present
    await expect(page).toHaveTitle(/NeighbourFriendly/i);

    // Check for the main hero heading
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();

    // Check for navigation links
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Products/i }).first()).toBeVisible();
    
    // Check for the call to action buttons
    await expect(page.getByRole('button', { name: /Sign In/i }).first()).toBeVisible();
  });
});
