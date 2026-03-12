-- Migration: Fix infinite recursion in RLS policies
-- The "Admins can view all profiles" policy queried the profiles table directly, 
-- causing an infinite recursion when evaluating SELECT policies on profiles.
-- We replace it with a call to the is_admin() SECURITY DEFINER function.

DO $$ 
BEGIN
  -- 1. Fix the recursive policy on profiles
  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  
  CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_admin());

  -- 2. Clean up some other policies that do direct selects on profiles to use is_admin() 
  -- for better performance and to avoid any other potential recursions.

  -- Listings
  DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;
  CREATE POLICY "Admins can manage all listings" ON public.listings FOR ALL USING (public.is_admin());

  -- Properties
  DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
  CREATE POLICY "Admins can manage all properties" ON public.properties FOR ALL USING (public.is_admin());

  -- Service Providers
  DROP POLICY IF EXISTS "Admins can manage all service providers" ON public.service_providers;
  CREATE POLICY "Admins can manage all service providers" ON public.service_providers FOR ALL USING (public.is_admin());

END $$;
