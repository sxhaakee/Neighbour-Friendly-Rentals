import { test as base, expect, Page } from '@playwright/test';

/**
 * Test credentials — set these in your .env.local or pass via CLI:
 *   PLAYWRIGHT_TEST_EMAIL=your@email.com
 *   PLAYWRIGHT_TEST_PASSWORD=yourpassword
 *   PLAYWRIGHT_OTHER_USER_ID=<uuid of another test user>
 */
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD || 'testpassword123';
const OTHER_USER_ID = process.env.PLAYWRIGHT_OTHER_USER_ID || '';

/**
 * Extended test fixture with auth helpers
 */
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill in credentials and submit
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for redirect away from login page
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 15_000,
    });

    await use(page);
  },
});

export { expect, TEST_EMAIL, TEST_PASSWORD, OTHER_USER_ID };
