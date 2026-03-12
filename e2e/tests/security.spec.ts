import { test, expect } from '@playwright/test';

/**
 * Security E2E tests — validates that the security fixes are working.
 * These tests verify protection against the vulnerabilities found in the audit.
 */
test.describe('Security', () => {
  
  test('profile API does not expose sensitive fields to anonymous users', async ({ request }) => {
    // Direct API call to profiles — should fail or return limited data
    const response = await request.get('/api/profiles', {
      failOnStatusCode: false,
    });
    
    // Should not return 200 with full profile data
    // Either 401 (unauthorized) or the response should NOT contain sensitive fields
    if (response.ok()) {
      const body = await response.text();
      expect(body).not.toContain('id_document_number');
      expect(body).not.toContain('id_document_url');
      expect(body).not.toContain('stripe_customer_id');
      expect(body).not.toContain('premium_payment_id');
    }
  });

  test('public_profiles view only exposes safe fields via Supabase', async ({ request }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      test.skip();
      return;
    }

    const response = await request.get(
      `${supabaseUrl}/rest/v1/public_profiles?select=*&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        failOnStatusCode: false,
      }
    );

    if (response.ok()) {
      const data = await response.json();
      if (data.length > 0) {
        const profile = data[0];
        
        // Safe fields SHOULD be present
        expect(profile).toHaveProperty('id');
        expect(profile).toHaveProperty('full_name');
        expect(profile).toHaveProperty('avatar_url');
        
        // Sensitive fields MUST NOT be present
        expect(profile).not.toHaveProperty('email');
        expect(profile).not.toHaveProperty('phone');
        expect(profile).not.toHaveProperty('address');
        expect(profile).not.toHaveProperty('id_document_number');
        expect(profile).not.toHaveProperty('id_document_url');
        expect(profile).not.toHaveProperty('is_admin');
        expect(profile).not.toHaveProperty('stripe_customer_id');
        expect(profile).not.toHaveProperty('premium_payment_id');
        expect(profile).not.toHaveProperty('referral_code');
      }
    }
  });

  test('robots.txt does not expose admin URL', async ({ page }) => {
    await page.goto('/robots.txt');
    const content = await page.textContent('body');
    
    expect(content).not.toContain('nfr-control');
  });

  test('no hardcoded API keys in JavaScript bundles', async ({ page }) => {
    await page.goto('/');
    
    // Get all script sources
    const scripts = await page.evaluate(() => {
      const scriptElements = document.querySelectorAll('script[src]');
      return Array.from(scriptElements).map(s => s.getAttribute('src') || '');
    });
    
    // Check each script for hardcoded keys
    for (const src of scripts.filter(s => s.startsWith('/_next/'))) {
      const response = await page.request.get(src);
      if (response.ok()) {
        const content = await response.text();
        
        // Should NOT contain a Razorpay live key
        expect(content).not.toContain('rzp_live_RZHNDjla2df5tS');
        
        // Should NOT contain service role key pattern
        expect(content).not.toMatch(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.service_role/);
      }
    }
  });

  test('admin route is not accessible to unauthenticated users', async ({ page }) => {
    await page.goto('/nfr-control');
    
    // Should redirect away from admin
    await page.waitForURL((url) => !url.pathname.startsWith('/nfr-control'), {
      timeout: 10_000,
    });
  });

  test('payment verification endpoint rejects invalid signatures', async ({ request }) => {
    const response = await request.post('/api/verify-payment', {
      data: {
        razorpay_order_id: 'order_fake123',
        razorpay_payment_id: 'pay_fake123',
        razorpay_signature: 'invalid_signature_here',
      },
      failOnStatusCode: false,
    });
    
    // Should return 400 or 500, NOT 200 with verified: true
    const data = await response.json();
    expect(data.verified).not.toBe(true);
  });

  test('source code does not contain sensitive routes in HTML', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    
    // HTML source should not reference the secret admin path
    expect(html).not.toContain('/nfr-control');
  });
});
