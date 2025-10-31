-- FIX ALL MISSING COLUMNS - Quick Setup
-- Copy and paste this ENTIRE script into Supabase SQL Editor and run it
-- This will add all missing columns needed for premium and payments

-- ============================================
-- PART 1: Add Premium Columns to Profiles
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_payment_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_plan TEXT CHECK (premium_plan IN ('monthly', 'yearly'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ALTER COLUMN is_premium SET DEFAULT FALSE;

-- ============================================
-- PART 2: Add Payment Columns to Revenue Tracking
-- ============================================

ALTER TABLE revenue_tracking ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE revenue_tracking ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
ALTER TABLE revenue_tracking ADD COLUMN IF NOT EXISTS booking_id UUID;
ALTER TABLE revenue_tracking ADD COLUMN IF NOT EXISTS listing_id UUID;

-- ============================================
-- PART 3: Verify All Columns Were Added
-- ============================================

-- Check profiles table
SELECT 'PROFILES TABLE:' as table_name;
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('is_premium', 'premium_plan', 'premium_expires_at', 'premium_payment_id')
ORDER BY column_name;

-- Check revenue_tracking table
SELECT 'REVENUE_TRACKING TABLE:' as table_name;
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'revenue_tracking' 
AND column_name IN ('payment_id', 'payment_status', 'booking_id', 'listing_id')
ORDER BY column_name;

-- ============================================
-- PART 4: Check Your Current Status
-- ============================================

SELECT 
  email,
  is_premium,
  premium_plan,
  premium_expires_at,
  premium_payment_id
FROM profiles
WHERE email = 'sheriefshakeeb313@gmail.com';  -- Replace with YOUR email

-- ============================================
-- PART 5: Activate Your Premium (Run After Part 1-4)
-- ============================================

-- UNCOMMENT AND RUN THIS AFTER VERIFYING COLUMNS EXIST:

-- UPDATE profiles
-- SET 
--   is_premium = true,
--   premium_plan = 'monthly',  -- or 'yearly'
--   premium_expires_at = NOW() + INTERVAL '1 month',  -- or '1 year'
--   premium_payment_id = 'manual_activation'
-- WHERE email = 'sheriefshakeeb313@gmail.com';  -- YOUR email

-- Verify premium is active:
-- SELECT email, is_premium, premium_plan, premium_expires_at 
-- FROM profiles 
-- WHERE email = 'sheriefshakeeb313@gmail.com';

-- ============================================
-- DONE! Now refresh your browser to see premium badge
-- ============================================
