import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login fields', async ({ page }) => {
    // Navigate to the local development environment or production URL
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseURL}/login`);

    // Ensure email input exists
    await expect(page.getByPlaceholder('test@example.com')).toBeVisible();

    // Ensure password input exists
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();

    // Look for Google auth button
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();

    // Confirm that the Sign In form acts appropriately
    const signInButton = page.getByRole('button', { name: 'Sign in', exact: true });
    await expect(signInButton).toBeVisible();
  });
});
