# Fix Cron Job HTTP Error

## 🔴 Current Error
Your cron job is showing "Failed (HTTP error 1.56 s)" because the edge function isn't properly deployed or configured.

---

## ✅ Step-by-Step Fix

### Step 1: Deploy the Edge Function First

```bash
# Login to Supabase
supabase login

# Link your project (get project ref from dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy check-premium-expiry

# Set environment variables
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Get your values:**
- `SUPABASE_URL`: From Supabase Dashboard > Settings > API > Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: From Supabase Dashboard > Settings > API > service_role key (secret!)

---

### Step 2: Test the Function Manually

```bash
# Get your anon key from Supabase Dashboard > Settings > API
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-premium-expiry' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Checked X premium users, revoked Y expired memberships"
}
```

---

### Step 3: Fix Cron Job Configuration

Go back to **cron-job.org** and update:

**URL:**
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-premium-expiry
```

**Headers:**
```
Authorization: Bearer YOUR_ANON_KEY
Content-Type: application/json
```

**Method:** POST

**Schedule:** Daily at 2:00 AM (or your preferred time)

---

## 🔧 Alternative: Use Supabase pg_cron (Better!)

Instead of cron-job.org, use Supabase's built-in cron:

### Step 1: Enable pg_cron Extension

1. Go to Supabase Dashboard > Database > Extensions
2. Search for "pg_cron"
3. Enable it

### Step 2: Create Cron Job in SQL Editor

```sql
-- Schedule function to run daily at midnight UTC
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

**Replace:**
- `YOUR_PROJECT_REF` with your actual project reference
- `YOUR_ANON_KEY` with your anon key from dashboard

### Step 3: Verify Cron Job

```sql
-- List all cron jobs
SELECT * FROM cron.job;

-- View cron job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## 🎯 Quick Fix Checklist

- [ ] Function is deployed: `supabase functions deploy check-premium-expiry`
- [ ] Environment variables are set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Function URL is correct: `https://PROJECT_REF.supabase.co/functions/v1/check-premium-expiry`
- [ ] Authorization header includes anon key
- [ ] Method is POST
- [ ] Test manually with curl first
- [ ] Cron job configuration updated

---

## 🔍 Debugging

### Check Function Logs

```bash
# View function logs
supabase functions logs check-premium-expiry --tail
```

Or in Supabase Dashboard:
1. Go to Edge Functions
2. Click on `check-premium-expiry`
3. View Logs tab

### Common Errors

**Error: "Function not found"**
- Solution: Deploy the function first

**Error: "Invalid API key"**
- Solution: Use anon key, not service role key in Authorization header

**Error: "CORS error"**
- Solution: This shouldn't happen with POST requests, but ensure headers are correct

**Error: "Environment variables not set"**
- Solution: Run `supabase secrets set` commands

---

## 📝 Complete Setup Commands

```bash
# 1. Login
supabase login

# 2. Link project
supabase link --project-ref abcdefghijklmnop

# 3. Set secrets
supabase secrets set SUPABASE_URL=https://abcdefghijklmnop.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_key_here

# 4. Deploy
supabase functions deploy check-premium-expiry

# 5. Test
curl -X POST \
  'https://abcdefghijklmnop.supabase.co/functions/v1/check-premium-expiry' \
  -H 'Authorization: Bearer eyJhbGc...your_anon_key' \
  -H 'Content-Type: application/json'
```

---

## 🎉 Success Indicators

✅ Function deploys without errors  
✅ Manual curl test returns success  
✅ Cron job shows "Success" status  
✅ Function logs show execution  
✅ Premium users get notifications when expired  

---

**Need Help?**
1. Check function logs in Supabase Dashboard
2. Test with curl first before setting up cron
3. Verify all environment variables are set
4. Make sure you're using the correct project reference

---

**Last Updated:** October 31, 2025  
**Status:** Ready to fix! 🚀
