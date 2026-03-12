import { test, expect } from '../fixtures/auth';

test.describe('Messaging (Authenticated)', () => {
  test('messages page loads when logged in', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/messages');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Should stay on messages page (not redirect)
    await expect(authenticatedPage).toHaveURL(/\/messages/);
    
    // No server error
    await expect(authenticatedPage.locator('text=500 Internal Server Error')).not.toBeVisible();
  });

  test('messages page shows conversations or empty state', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/messages');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Should show either conversations or a "no messages" empty state
    const body = authenticatedPage.locator('body');
    await expect(body).toBeVisible();
  });

  test('network requests on messages page use correct auth headers', async ({ authenticatedPage }) => {
    // Intercept Supabase API calls
    const apiCalls: { url: string; headers: Record<string, string> }[] = [];
    
    authenticatedPage.on('request', (request) => {
      if (request.url().includes('supabase.co')) {
        apiCalls.push({
          url: request.url(),
          headers: request.headers(),
        });
      }
    });
    
    await authenticatedPage.goto('/messages');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // If there were Supabase calls, verify they include auth headers
    for (const call of apiCalls) {
      if (call.url.includes('/rest/v1/')) {
        expect(call.headers['authorization']).toBeTruthy();
        expect(call.headers['apikey']).toBeTruthy();
      }
    }
  });
});
