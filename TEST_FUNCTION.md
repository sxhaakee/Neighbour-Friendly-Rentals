# Test Your Edge Function

## ✅ Function Deployed Successfully!

Your function is now live at:
```
https://epolbovqrclrfozfgwvc.supabase.co/functions/v1/check-premium-expiry
```

---

## 🧪 Test It Now

### Step 1: Get Your Anon Key

1. Go to: https://supabase.com/dashboard/project/epolbovqrclrfozfgwvc/settings/api
2. Copy the `anon` `public` key

### Step 2: Test with Curl

```bash
curl -X POST \
  'https://epolbovqrclrfozfgwvc.supabase.co/functions/v1/check-premium-expiry' \
  -H 'Authorization: Bearer YOUR_ANON_KEY_HERE' \
  -H 'Content-Type: application/json'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Checked X premium users, revoked Y expired memberships",
  "checked": 0,
  "revoked": 0
}
```

---

## 🔧 Update Cron Job

Now update your cron-job.org settings:

### URL:
```
https://epolbovqrclrfozfgwvc.supabase.co/functions/v1/check-premium-expiry
```

### Method:
```
POST
```

### Headers:
Add this header:
- **Name:** `Authorization`
- **Value:** `Bearer YOUR_ANON_KEY`

(Replace `YOUR_ANON_KEY` with the key from Step 1)

### Schedule:
```
Daily at 2:00 AM (or your preferred time)
```

---

## ✅ What Changed

I fixed the function to:
1. ✅ Use automatically provided environment variables (no need to set SUPABASE_URL/KEY)
2. ✅ Added CORS headers for web requests
3. ✅ Better error handling and logging
4. ✅ Returns more detailed response (checked/revoked counts)

---

## 🎯 Next Steps

1. Get your anon key from dashboard
2. Test with curl command above
3. Update cron-job.org with the Authorization header
4. Your cron job will now work! ✅

---

## 📊 Monitor Function

View logs in dashboard:
https://supabase.com/dashboard/project/epolbovqrclrfozfgwvc/functions/check-premium-expiry/logs

---

**Status:** Function deployed and ready! Just add the Authorization header to your cron job! 🚀
