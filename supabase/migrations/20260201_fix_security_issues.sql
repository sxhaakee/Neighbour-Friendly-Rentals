-- Migration to Fix Security Advisor Issues
-- This migration addresses:
-- 1. SECURITY DEFINER views that should be SECURITY INVOKER
-- 2. RLS not enabled on analytics_events table
-- Generated using actual database schema on 2026-02-01

-- =============================================================================
-- FIX 1: Enable RLS on analytics_events table
-- =============================================================================

-- Enable Row Level Security on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events
-- Policy: Users can view their own analytics events
CREATE POLICY "Users can view their own analytics events" 
  ON public.analytics_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own analytics events
CREATE POLICY "Users can insert their own analytics events" 
  ON public.analytics_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do everything (for admin/system operations)
CREATE POLICY "Service role can manage all analytics events" 
  ON public.analytics_events 
  FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================================================
-- FIX 2: Recreate listing_stats view with SECURITY INVOKER
-- =============================================================================

-- Drop existing view
DROP VIEW IF EXISTS public.listing_stats CASCADE;

-- Recreate with SECURITY INVOKER (using actual schema)
CREATE VIEW public.listing_stats 
WITH (security_invoker = true)
AS
SELECT 
  l.id,
  l.title,
  l.user_id,
  l.category,
  l.created_at,
  COUNT(DISTINCT b.id) as booking_count,
  0 as view_count,
  0 as average_rating,
  0 as review_count
FROM listings l
LEFT JOIN bookings b ON l.id = b.listing_id
GROUP BY l.id, l.title, l.user_id, l.category, l.created_at;

-- Grant appropriate permissions
GRANT SELECT ON public.listing_stats TO authenticated;

-- =============================================================================
-- FIX 3: Recreate active_rental_agreements view with SECURITY INVOKER
-- =============================================================================

-- Drop existing view
DROP VIEW IF EXISTS public.active_rental_agreements CASCADE;

-- Recreate with SECURITY INVOKER (using actual schema: renter_id, renter_email)
CREATE VIEW public.active_rental_agreements 
WITH (security_invoker = true)
AS
SELECT 
  b.id,
  b.listing_id,
  b.renter_id,
  b.start_date,
  b.end_date,
  b.status,
  b.total_price,
  l.title as listing_title,
  l.category,
  b.renter_email,
  o.email as owner_email
FROM bookings b
INNER JOIN listings l ON b.listing_id = l.id
INNER JOIN auth.users o ON l.user_id = o.id
WHERE b.status = 'active' 
  AND b.end_date >= CURRENT_DATE;

-- Grant appropriate permissions
GRANT SELECT ON public.active_rental_agreements TO authenticated;

-- =============================================================================
-- FIX 4: Recreate leaderboard_view with SECURITY INVOKER
-- =============================================================================

-- Drop existing view
DROP VIEW IF EXISTS public.leaderboard_view CASCADE;

-- Recreate with SECURITY INVOKER (using actual schema: renter_id)
CREATE VIEW public.leaderboard_view 
WITH (security_invoker = true)
AS
SELECT 
  u.id as user_id,
  p.full_name,
  p.avatar_url,
  COUNT(DISTINCT l.id) as listing_count,
  COUNT(DISTINCT b.id) as booking_count,
  0 as average_rating,
  0 as review_count,
  -- Calculate a score based on activity
  (COUNT(DISTINCT l.id) * 10 + 
   COUNT(DISTINCT b.id) * 5) as leaderboard_score
FROM auth.users u
INNER JOIN profiles p ON u.id = p.id
LEFT JOIN listings l ON u.id = l.user_id AND l.status = 'active'
LEFT JOIN bookings b ON u.id = b.renter_id
GROUP BY u.id, p.full_name, p.avatar_url
HAVING COUNT(DISTINCT l.id) > 0 OR COUNT(DISTINCT b.id) > 0
ORDER BY leaderboard_score DESC;

-- Grant appropriate permissions
GRANT SELECT ON public.leaderboard_view TO authenticated;

-- =============================================================================
-- FIX 5: Recreate verification_stats view with SECURITY INVOKER
-- =============================================================================

-- Drop existing view
DROP VIEW IF EXISTS public.verification_stats CASCADE;

-- Recreate with SECURITY INVOKER (using actual schema: only id_verified exists)
CREATE VIEW public.verification_stats 
WITH (security_invoker = true)
AS
SELECT 
  u.id as user_id,
  p.full_name,
  p.id_verification_status as verification_status,
  p.id_verified,
  COUNT(DISTINCT l.id) as verified_listings,
  CASE 
    WHEN p.id_verified THEN 'verified'
    ELSE 'unverified'
  END as overall_verification_level
FROM auth.users u
INNER JOIN profiles p ON u.id = p.id
LEFT JOIN listings l ON u.id = l.user_id
GROUP BY u.id, p.full_name, p.id_verification_status, p.id_verified;

-- Grant appropriate permissions
GRANT SELECT ON public.verification_stats TO authenticated;

-- Add RLS policy for profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);
  END IF;
END $$;

-- =============================================================================
-- Add Indexes for Performance
-- =============================================================================

-- Indexes to improve view performance
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- =============================================================================
-- Add Comments for Documentation
-- =============================================================================

COMMENT ON VIEW public.listing_stats IS 'Aggregated statistics for listings including bookings. Uses SECURITY INVOKER for proper RLS enforcement.';
COMMENT ON VIEW public.active_rental_agreements IS 'Currently active rental agreements with full details. Uses SECURITY INVOKER for proper RLS enforcement.';
COMMENT ON VIEW public.leaderboard_view IS 'User leaderboard based on activity. Uses SECURITY INVOKER for proper RLS enforcement.';
COMMENT ON VIEW public.verification_stats IS 'User verification status and statistics. Uses SECURITY INVOKER for proper RLS enforcement.';
COMMENT ON POLICY "Users can view their own analytics events" ON public.analytics_events IS 'Allows users to view their own analytics events only.';

-- Migration complete
-- All SECURITY DEFINER views have been converted to SECURITY INVOKER
-- RLS has been enabled on analytics_events table with appropriate policies
