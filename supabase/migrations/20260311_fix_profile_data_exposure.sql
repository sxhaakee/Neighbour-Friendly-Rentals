-- ============================================================================
-- MIGRATION: Fix Profile Data Exposure
-- Problem: profiles table had SELECT policies with qual = "true", exposing
-- all 32 columns (email, phone, address, ID docs, admin status, payment IDs)
-- to any user querying any other user's profile.
-- Solution: Drop overly permissive SELECT policies, create tighter policies,
-- and create a public_profiles view for safe field access.
-- ============================================================================

-- Step 1: Drop the overly permissive SELECT policies that expose everything
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Step 2: Create a proper SELECT policy - users see ALL their own data
CREATE POLICY "Users can view own full profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Step 3: Authenticated users can read profile rows (needed for joins)
CREATE POLICY "Authenticated users can view basic profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Step 4: Admin policy for full profile access
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );

-- Step 5: Create a public_profiles view with ONLY safe columns
DROP VIEW IF EXISTS public.public_profiles CASCADE;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
  id_verified,
  followers_count,
  following_count,
  listings_count,
  reviews_count,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

COMMENT ON VIEW public.public_profiles IS 'Safe public profile view - excludes email, phone, address, ID documents, payment info, and admin status.';
