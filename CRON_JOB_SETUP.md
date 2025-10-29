# Premium Expiry Cron Job Setup Guide

## Overview
This guide explains how to set up an automated cron job to check and revoke expired premium memberships daily.

---

## Option 1: Supabase Edge Function (Recommended)

### Step 1: Install Supabase CLI

**For macOS (using Homebrew):**
```bash
brew install supabase/tap/supabase
```

**For macOS/Linux (using npm - NOT recommended, use Homebrew instead):**
```bash
# Note: npm global install is not supported
# Use Homebrew or download binary instead
```

**Alternative - Download Binary:**
```bash
# Visit: https://github.com/supabase/cli/releases
# Download the appropriate binary for your OS
```

### Step 2: Initialize and Create Edge Function
```bash
# Initialize Supabase in your project
supabase init

# Create a new edge function
supabase functions new check-premium-expiry
```

### Step 2: Function Code
Create `/supabase/functions/check-premium-expiry/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all premium users
    const { data: premiumUsers, error } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, premium_expires_at')
      .eq('is_premium', true)
      .not('premium_expires_at', 'is', null)

    if (error) throw error

    let expiredCount = 0
    const now = new Date()

    // Check each user
    for (const user of premiumUsers || []) {
      const expiryDate = new Date(user.premium_expires_at)
      
      if (expiryDate < now) {
        // Premium has expired - revoke access
        await supabaseClient
          .from('profiles')
          .update({
            is_premium: false,
            premium_expires_at: null,
            premium_payment_id: null,
            premium_plan: null,
          })
          .eq('id', user.id)

        // Send notification
        await supabaseClient.from('notifications').insert({
          user_id: user.id,
          type: 'system',
          title: '⏰ Premium Membership Expired',
          message: 'Your premium membership has expired. Renew now to continue enjoying unlimited listings!',
          link: '/premium',
          read: false,
        })

        expiredCount++
        console.log(`Revoked premium for user: ${user.email}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked ${premiumUsers?.length || 0} premium users, revoked ${expiredCount} expired memberships`,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### Step 3: Deploy Edge Function
```bash
# Deploy the function
supabase functions deploy check-premium-expiry

# Get the function URL
# It will be: https://<project-ref>.supabase.co/functions/v1/check-premium-expiry
```

### Step 4: Set up Cron Job
Use a service like **cron-job.org** or **EasyCron**:

1. Go to https://cron-job.org (free)
2. Create account
3. Add new cron job:
   - **URL:** `https://<your-project>.supabase.co/functions/v1/check-premium-expiry`
   - **Schedule:** Daily at 2:00 AM
   - **Method:** GET or POST
   - **Headers:** Add `Authorization: Bearer <your-anon-key>`

---

## Option 2: Node.js Script with GitHub Actions

### Step 1: Create Script
Create `/scripts/check-premium-expiry.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkPremiumExpiry() {
  try {
    // Get all premium users
    const { data: premiumUsers, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, premium_expires_at')
      .eq('is_premium', true)
      .not('premium_expires_at', 'is', null);

    if (error) throw error;

    let expiredCount = 0;
    const now = new Date();

    for (const user of premiumUsers || []) {
      const expiryDate = new Date(user.premium_expires_at);
      
      if (expiryDate < now) {
        // Revoke premium
        await supabase
          .from('profiles')
          .update({
            is_premium: false,
            premium_expires_at: null,
            premium_payment_id: null,
            premium_plan: null,
          })
          .eq('id', user.id);

        // Send notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'system',
          title: '⏰ Premium Membership Expired',
          message: 'Your premium membership has expired. Renew now!',
          link: '/premium',
          read: false,
        });

        expiredCount++;
        console.log(`✅ Revoked premium for: ${user.email}`);
      }
    }

    console.log(`\n📊 Summary: Checked ${premiumUsers?.length || 0} users, revoked ${expiredCount} expired memberships`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPremiumExpiry();
```

### Step 2: GitHub Actions Workflow
Create `.github/workflows/check-premium-expiry.yml`:

```yaml
name: Check Premium Expiry

on:
  schedule:
    # Run daily at 2:00 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  check-expiry:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install @supabase/supabase-js
      
      - name: Run expiry check
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: node scripts/check-premium-expiry.js
```

### Step 3: Add Secrets to GitHub
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## Option 3: Vercel Cron Jobs

If you're deploying on Vercel, create `/api/cron/check-premium-expiry.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  );

  try {
    const { data: premiumUsers } = await supabase
      .from('profiles')
      .select('id, email, premium_expires_at')
      .eq('is_premium', true)
      .not('premium_expires_at', 'is', null);

    let expiredCount = 0;
    const now = new Date();

    for (const user of premiumUsers || []) {
      const expiryDate = new Date(user.premium_expires_at);
      
      if (expiryDate < now) {
        await supabase
          .from('profiles')
          .update({
            is_premium: false,
            premium_expires_at: null,
          })
          .eq('id', user.id);

        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'system',
          title: '⏰ Premium Expired',
          message: 'Renew now to continue unlimited listings!',
          link: '/premium',
          read: false,
        });

        expiredCount++;
      }
    }

    res.status(200).json({
      success: true,
      checked: premiumUsers?.length || 0,
      expired: expiredCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/check-premium-expiry",
    "schedule": "0 2 * * *"
  }]
}
```

---

## Testing

### Manual Test (Local)
```bash
# Using the razorpayService function directly
node -e "
const { razorpayService } = require('./src/services/razorpayService');
razorpayService.checkAndRevokeExpiredPremium('user-id-here');
"
```

### Test Edge Function
```bash
curl -X POST https://<project>.supabase.co/functions/v1/check-premium-expiry \
  -H "Authorization: Bearer <anon-key>"
```

---

## Monitoring

### Add Logging
All options above include console.log statements. Monitor them via:
- **Supabase:** Function logs in dashboard
- **GitHub Actions:** Workflow run logs
- **Vercel:** Function logs in dashboard

### Email Alerts (Optional)
Add email notification when cron job runs:

```javascript
// At the end of your cron function
await sendEmail({
  to: 'admin@nfrr.com',
  subject: 'Premium Expiry Check Complete',
  body: `Checked ${total} users, revoked ${expired} memberships`
});
```

---

## Recommended Setup

**For Production:** Use **Supabase Edge Functions** + **cron-job.org**
- ✅ Serverless (no infrastructure to maintain)
- ✅ Free tier available
- ✅ Easy to monitor
- ✅ Reliable

**For Development:** Use **GitHub Actions**
- ✅ Free for public repos
- ✅ Easy to test
- ✅ Version controlled

---

## Troubleshooting

### Cron not running?
- Check cron service is active
- Verify URL is correct
- Check authorization headers
- Review function logs

### Users not being revoked?
- Verify `premium_expires_at` format is correct
- Check timezone issues (use UTC)
- Ensure database permissions are correct

---

**Last Updated:** October 29, 2025
**Status:** Ready to implement
