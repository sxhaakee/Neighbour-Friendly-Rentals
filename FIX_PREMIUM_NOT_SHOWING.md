# Fix Premium Not Showing After Payment

## 🔴 Problem
You paid for premium but it's not showing up on the site.

---

## 🔍 Step 1: Check What Happened

### Go to Supabase SQL Editor:
https://supabase.com/dashboard/project/epolbovqrclrfozfgwvc/sql/new

### Run this query:
```sql
-- Check your premium status
SELECT 
  id,
  email,
  full_name,
  is_premium,
  premium_plan,
  premium_expires_at,
  premium_payment_id
FROM profiles
WHERE email = 'sheriefshakeeb313@gmail.com';  -- Replace with YOUR email
```

**What to look for:**
- `is_premium` should be `true`
- `premium_plan` should be `monthly` or `yearly`
- `premium_expires_at` should be a future date
- `premium_payment_id` should have your payment ID

---

## 🔧 Step 2: Check Payment Record

```sql
-- Check if payment was recorded
SELECT 
  revenue_type,
  amount,
  payment_id,
  payment_status,
  description,
  created_at
FROM revenue_tracking
WHERE user_id = (SELECT id FROM profiles WHERE email = 'sheriefshakeeb313@gmail.com')
ORDER BY created_at DESC
LIMIT 5;
```

**What to look for:**
- Should see a `premium` revenue entry
- `payment_status` should be `completed`
- `payment_id` should match Razorpay payment ID

---

## ✅ Step 3: Manual Fix (If Needed)

If payment exists but `is_premium` is still `false`:

```sql
-- MANUAL FIX: Set premium status
UPDATE profiles
SET 
  is_premium = true,
  premium_plan = 'monthly',  -- Change to 'yearly' if you paid yearly
  premium_expires_at = NOW() + INTERVAL '1 month',  -- or '1 year' for yearly
  premium_payment_id = 'pay_xxxxx'  -- Get from revenue_tracking query above
WHERE email = 'sheriefshakeeb313@gmail.com';  -- Your email
```

### Verify it worked:
```sql
SELECT is_premium, premium_plan, premium_expires_at 
FROM profiles 
WHERE email = 'sheriefshakeeb313@gmail.com';
```

Should show:
- `is_premium`: `true`
- `premium_plan`: `monthly` or `yearly`
- `premium_expires_at`: Future date

---

## 🎯 Step 4: Refresh Your Browser

After fixing in database:
1. **Hard refresh** your browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Or **logout and login again**
3. Premium badge should now appear!

---

## 🐛 Common Issues

### Issue 1: Payment succeeded but update failed
**Cause:** Database error during profile update  
**Fix:** Run manual fix SQL above

### Issue 2: Wrong user ID
**Cause:** Logged in with different account  
**Fix:** Make sure you're logged in with the email you paid with

### Issue 3: Browser cache
**Cause:** Old data cached in browser  
**Fix:** Hard refresh or clear cache

### Issue 4: Profile not found
**Cause:** Email mismatch  
**Fix:** Check exact email in Razorpay dashboard vs your login

---

## 📊 Debug Checklist

Run these queries in order:

```sql
-- 1. Find your user ID
SELECT id, email, is_premium FROM profiles WHERE email = 'YOUR_EMAIL';

-- 2. Check all premium users (to see if others work)
SELECT email, is_premium, premium_plan, premium_expires_at 
FROM profiles 
WHERE is_premium = true;

-- 3. Check all revenue records
SELECT * FROM revenue_tracking 
WHERE revenue_type = 'premium' 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check if profiles table has correct columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('is_premium', 'premium_plan', 'premium_expires_at', 'premium_payment_id');
```

---

## 🚀 Quick Fix Script

If you just want to fix it NOW:

```sql
-- Replace YOUR_EMAIL with your actual email
UPDATE profiles
SET 
  is_premium = true,
  premium_plan = 'monthly',
  premium_expires_at = NOW() + INTERVAL '1 month'
WHERE email = 'YOUR_EMAIL';

-- Verify
SELECT email, is_premium, premium_plan, premium_expires_at 
FROM profiles 
WHERE email = 'YOUR_EMAIL';
```

Then **hard refresh** your browser!

---

## 💡 Prevention

To prevent this in the future, I should add:
1. Better error logging in payment handler
2. Retry logic for database updates
3. Email notification when premium activates
4. Admin panel to manually activate premium

---

## 📞 Still Not Working?

1. Check browser console for errors (F12 > Console)
2. Check Supabase logs for errors
3. Verify you're logged in with correct email
4. Try incognito/private window
5. Check if `is_premium` is actually `true` in database

---

**Most likely:** Payment succeeded but database update failed. Run the manual fix SQL and you'll be good! 💪
