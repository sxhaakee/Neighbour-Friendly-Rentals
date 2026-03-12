import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright E2E Test Configuration for NFRR Rental Marketplace
 * 
 * Run tests:
 *   npm run test:e2e           — run all tests headless
 *   npm run test:e2e:ui        — run with Playwright UI
 *   npm run test:e2e:headed    — run with visible browser
 */
export default defineConfig({
  testDir: './e2e/tests',
  
  /* Maximum time one test can run */
  timeout: 30_000,
  
  /* Assertion timeout */
  expect: {
    timeout: 10_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Reporter */
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],

  /* Shared settings for all projects */
  use: {
    /* Base URL for navigation */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Capture trace on first retry */
    trace: 'on-first-retry',

    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'on-first-retry',
  },

  /* Test projects/browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to add more browsers:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  /* Start local dev server before running tests */
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },

  /* Output directory for test artifacts */
  outputDir: './e2e/test-results',
});
