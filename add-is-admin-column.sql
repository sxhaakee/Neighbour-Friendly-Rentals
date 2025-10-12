-- ============================================
-- ADD is_admin COLUMN TO PROFILES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add is_admin column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set your account as admin (replace with your email)
UPDATE profiles
SET is_admin = true
WHERE email = 'friendlyrentals.mlr@gmail.com';  -- Replace with your admin email

-- Verify it worked
SELECT id, email, is_admin, full_name
FROM profiles
WHERE is_admin = true;

-- Should show your account with is_admin = true
