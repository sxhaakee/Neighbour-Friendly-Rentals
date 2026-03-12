-- Migration: Fix recursive RLS and tighten profile security
-- This migration drops existing problematic SELECT policies and sets up clean ones.

-- 1. Resolve potential recursion in SELECT policies
-- We use a SECURITY DEFINER function with row_security = off to check for admin status safely.

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR is_admin = true)
  );
END;
$$;

-- 2. Drop all existing SELECT policies on profiles to start fresh
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- 3. Create clean, non-recursive SELECT policies

-- Policy 1: Users see ALL columns of their own profile
CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Admins see ALL columns of ALL profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- Policy 3: Authenticated users can see NO columns from profiles table directly 
-- (They must use public_profiles view for basic info)
-- This fixes the data exposure issue.
-- NOTE: We don't need a policy here if we want to block all other selects. 
-- Policies in PostgreSQL are strictly additive. If no policy matches, access is denied.

-- 4. Ensure public_profiles view is available for safe access
CREATE OR REPLACE VIEW public.public_profiles
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
