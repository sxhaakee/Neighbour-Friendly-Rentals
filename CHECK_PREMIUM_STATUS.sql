-- Check Premium Status for Your Account
-- Run this in Supabase SQL Editor

-- 1. Check your profile premium status
SELECT 
  id,
  email,
  full_name,
  is_premium,
  premium_plan,
  premium_expires_at,
  premium_payment_id,
  created_at
FROM profiles
WHERE email = 'sheriefshakeeb313@gmail.com';  -- Replace with your email

-- 2. Check revenue tracking for your payments
SELECT 
  id,
  revenue_type,
  amount,
  payment_id,
  payment_status,
  description,
  created_at
FROM revenue_tracking
WHERE user_id = (SELECT id FROM profiles WHERE email = 'sheriefshakeeb313@gmail.com')
ORDER BY created_at DESC;

-- 3. If premium is FALSE but payment exists, manually fix it:
-- UNCOMMENT AND RUN THIS IF NEEDED:

-- UPDATE profiles
-- SET 
--   is_premium = true,
--   premium_plan = 'monthly',  -- or 'yearly'
--   premium_expires_at = NOW() + INTERVAL '1 month',  -- or '1 year'
--   premium_payment_id = 'YOUR_PAYMENT_ID_FROM_REVENUE_TRACKING'
-- WHERE email = 'sheriefshakeeb313@gmail.com';

-- 4. Verify the update worked:
-- SELECT is_premium, premium_plan, premium_expires_at 
-- FROM profiles 
-- WHERE email = 'sheriefshakeeb313@gmail.com';
