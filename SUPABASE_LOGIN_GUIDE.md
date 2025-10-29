# Supabase CLI Login & Deployment Guide

## 🔐 Login to Supabase

### Step 1: Login with Access Token

Since you want to use your Google/GitHub account, follow these steps:

```bash
supabase login
```

This will open your browser and prompt you to authorize the Supabase CLI.

**Alternative - Using Access Token:**

1. **Get your access token:**
   - Go to https://supabase.com/dashboard/account/tokens
   - Login with your Google account (same as GitHub)
   - Click "Generate new token"
   - Give it a name (e.g., "NFRR Project")
   - Copy the token

2. **Login using the token:**
   ```bash
   supabase login
   ```
   - Paste the token when prompted
   
   **OR set as environment variable:**
   ```bash
   export SUPABASE_ACCESS_TOKEN="your-token-here"
   ```

---

## 🚀 Deploy Edge Function

### Step 1: Link Your Project

```bash
# Get your project reference from Supabase dashboard
# URL format: https://app.supabase.com/project/YOUR_PROJECT_REF

supabase link --project-ref YOUR_PROJECT_REF
```

**Example:**
```bash
supabase link --project-ref abcdefghijklmnop
```

### Step 2: Deploy the Function

```bash
supabase functions deploy check-premium-expiry
```

---

## 📝 Complete Workflow

```bash
# 1. Install Supabase CLI (if not done)
brew install supabase/tap/supabase

# 2. Login
supabase login

# 3. Initialize (already done)
# supabase init

# 4. Create function (already done)
# supabase functions new check-premium-expiry

# 5. Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# 6. Deploy
supabase functions deploy check-premium-expiry

# 7. Set up cron job in Supabase dashboard
# Go to Database > Extensions > pg_cron
# Create a cron job to call your function daily
```

---

## 🔧 Troubleshooting

### Error: "Access token not provided"
**Solution:** Run `supabase login` first

### Error: "Project not linked"
**Solution:** Run `supabase link --project-ref YOUR_PROJECT_REF`

### Error: "Function already exists"
**Solution:** This is fine! It will update the existing function

---

## 🎯 Quick Commands

```bash
# Check login status
supabase projects list

# View function logs
supabase functions logs check-premium-expiry

# Test function locally
supabase functions serve check-premium-expiry

# Deploy with environment variables
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_KEY=your-key
```

---

## 📍 Find Your Project Reference

1. Go to https://supabase.com/dashboard
2. Select your project
3. Look at the URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`
4. Copy the `YOUR_PROJECT_REF` part

**OR**

1. Go to Project Settings > General
2. Find "Reference ID"
3. Copy it

---

## ✅ Verify Deployment

After deploying, verify in Supabase Dashboard:

1. Go to **Edge Functions** section
2. You should see `check-premium-expiry` listed
3. Click on it to see details and logs
4. Test it by clicking "Invoke" button

---

## 🔄 Set Up Cron Job

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to **Database** > **Extensions**
2. Enable `pg_cron` extension
3. Go to **SQL Editor**
4. Run this SQL:

```sql
-- Schedule function to run daily at midnight
SELECT cron.schedule(
  'check-premium-expiry-daily',
  '0 0 * * *',  -- Every day at midnight
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-premium-expiry',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### Option 2: Using GitHub Actions (Alternative)

See `CRON_JOB_SETUP.md` for GitHub Actions workflow.

---

## 🎉 You're Done!

Your edge function is now deployed and will run daily to check for expired premium memberships!

**Next Steps:**
1. Monitor the function logs
2. Test with a test user
3. Verify premium expiry works correctly

---

**Last Updated:** October 29, 2025  
**Status:** Ready to deploy! 🚀
