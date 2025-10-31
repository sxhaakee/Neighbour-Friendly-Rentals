# Quick Fix for Cron Job Error

## 🔴 Problem
Your cron job at `https://gsbcqwperfqsgwvc.supabase.co/functions/...` is failing.

---

## ⚡ Quick Fix (5 minutes)

### Option 1: Deploy Function First (REQUIRED)

The function must be deployed before the cron job can call it:

```bash
# 1. Login to Supabase
supabase login

# 2. Link your project
supabase link --project-ref gsbcqwperfqsgwvc

# 3. Deploy the function
supabase functions deploy check-premium-expiry

# 4. Set environment variables
supabase secrets set SUPABASE_URL=https://gsbcqwperfqsgwvc.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get service role key:**
1. Go to https://supabase.com/dashboard/project/gsbcqwperfqsgwvc/settings/api
2. Copy the `service_role` key (keep it secret!)

---

### Option 2: Update Cron Job Settings

After deploying, update your cron-job.org settings:

**URL:**
```
https://gsbcqwperfqsgwvc.supabase.co/functions/v1/check-premium-expiry
```

**Method:** POST

**Headers:**
Add this header:
```
Authorization: Bearer YOUR_ANON_KEY
```

**Get anon key:**
1. Go to https://supabase.com/dashboard/project/gsbcqwperfqsgwvc/settings/api
2. Copy the `anon` `public` key

---

### Option 3: Test It Works

```bash
# Test the function manually
curl -X POST \
  'https://gsbcqwperfqsgwvc.supabase.co/functions/v1/check-premium-expiry' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

If this returns success, your cron job will work!

---

## 🎯 Most Likely Issue

**The function isn't deployed yet!**

Run these commands:
```bash
supabase login
supabase link --project-ref gsbcqwperfqsgwvc
supabase functions deploy check-premium-expiry
```

Then test with curl, then the cron job will work!

---

## ✅ Success Checklist

- [ ] Function deployed (run deploy command)
- [ ] Environment variables set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Curl test returns success
- [ ] Cron job updated with Authorization header
- [ ] Cron job shows "Success" instead of "Failed"

---

**Need the exact commands?** See `FIX_CRON_JOB_ERROR.md` for detailed guide!
