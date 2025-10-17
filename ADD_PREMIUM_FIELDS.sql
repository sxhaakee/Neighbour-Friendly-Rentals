-- =====================================================
-- ADD PREMIUM MEMBERSHIP FIELDS TO PROFILES
-- =====================================================
-- Run this in Supabase SQL Editor

-- Add premium membership fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS premium_plan VARCHAR(50), -- 'monthly', 'yearly', 'lifetime'
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_premium_expires ON profiles(premium_expires_at);

-- Create a function to check if premium is active
CREATE OR REPLACE FUNCTION is_premium_active(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  premium_status BOOLEAN;
  expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT is_premium, premium_expires_at 
  INTO premium_status, expiry_date
  FROM profiles 
  WHERE id = user_id;
  
  -- If premium is true and either no expiry or expiry is in future
  IF premium_status = TRUE AND (expiry_date IS NULL OR expiry_date > NOW()) THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get listing counts for a user
CREATE OR REPLACE FUNCTION get_user_listing_counts(user_id UUID)
RETURNS TABLE(
  items_count BIGINT,
  properties_count BIGINT,
  services_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM listings WHERE owner_id = user_id)::BIGINT as items_count,
    (SELECT COUNT(*) FROM properties WHERE owner_id = user_id)::BIGINT as properties_count,
    (SELECT COUNT(*) FROM service_providers WHERE owner_id = user_id)::BIGINT as services_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_premium_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_listing_counts(UUID) TO authenticated;

-- =====================================================
-- VERIFY CHANGES
-- =====================================================

-- Check if columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name IN ('is_premium', 'premium_expires_at', 'premium_plan', 'stripe_customer_id', 'stripe_subscription_id');

-- Test the functions
SELECT is_premium_active(auth.uid());
SELECT * FROM get_user_listing_counts(auth.uid());

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Make a user premium (for testing)
-- UPDATE profiles SET is_premium = TRUE WHERE id = 'user-uuid-here';

-- Make a user premium with expiry
-- UPDATE profiles 
-- SET is_premium = TRUE, 
--     premium_expires_at = NOW() + INTERVAL '30 days',
--     premium_plan = 'monthly'
-- WHERE id = 'user-uuid-here';

-- Check listing counts for current user
-- SELECT * FROM get_user_listing_counts(auth.uid());
