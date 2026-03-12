-- Migration: Clean up recursive profile queries in all tables
-- This migration updates all leftover policies that query the `profiles` table directly 
-- via EXISTS(SELECT 1 FROM profiles...), replacing them with the `is_admin()` function
-- which runs as SECURITY DEFINER. This safely stops any recursion while fetching collections.

DO $$ 
BEGIN
  -- Listings policies
  DROP POLICY IF EXISTS "listings_delete_policy" ON public.listings;
  DROP POLICY IF EXISTS "listings_insert_policy" ON public.listings;
  DROP POLICY IF EXISTS "listings_select_policy" ON public.listings;
  DROP POLICY IF EXISTS "listings_update_policy" ON public.listings;

  CREATE POLICY "listings_delete_policy" ON public.listings FOR DELETE
  USING ( public.is_admin() OR auth.uid() = owner_id );

  CREATE POLICY "listings_insert_policy" ON public.listings FOR INSERT
  WITH CHECK ( public.is_admin() OR auth.uid() = owner_id );

  CREATE POLICY "listings_select_policy" ON public.listings FOR SELECT
  USING ( public.is_admin() OR status = 'approved' OR auth.uid() = owner_id );

  CREATE POLICY "listings_update_policy" ON public.listings FOR UPDATE
  USING ( public.is_admin() OR auth.uid() = owner_id )
  WITH CHECK ( public.is_admin() OR auth.uid() = owner_id );

  -- Properties policies
  DROP POLICY IF EXISTS "properties_delete_policy" ON public.properties;
  DROP POLICY IF EXISTS "properties_insert_policy" ON public.properties;
  DROP POLICY IF EXISTS "properties_select_policy" ON public.properties;
  DROP POLICY IF EXISTS "properties_update_policy" ON public.properties;

  CREATE POLICY "properties_delete_policy" ON public.properties FOR DELETE
  USING ( public.is_admin() OR auth.uid() = owner_id );

  CREATE POLICY "properties_insert_policy" ON public.properties FOR INSERT
  WITH CHECK ( public.is_admin() OR auth.uid() = owner_id );

  CREATE POLICY "properties_select_policy" ON public.properties FOR SELECT
  USING ( public.is_admin() OR status = 'approved' OR auth.uid() = owner_id );

  CREATE POLICY "properties_update_policy" ON public.properties FOR UPDATE
  USING ( public.is_admin() OR auth.uid() = owner_id )
  WITH CHECK ( public.is_admin() OR auth.uid() = owner_id );

  -- Service Providers policies
  DROP POLICY IF EXISTS "service_providers_delete_policy" ON public.service_providers;
  DROP POLICY IF EXISTS "service_providers_insert_policy" ON public.service_providers;
  DROP POLICY IF EXISTS "service_providers_select_policy" ON public.service_providers;
  DROP POLICY IF EXISTS "service_providers_update_policy" ON public.service_providers;

  CREATE POLICY "service_providers_delete_policy" ON public.service_providers FOR DELETE
  USING ( public.is_admin() OR auth.uid() = owner_id );

  CREATE POLICY "service_providers_insert_policy" ON public.service_providers FOR INSERT
  WITH CHECK ( public.is_admin() OR auth.uid() = owner_id );

  CREATE POLICY "service_providers_select_policy" ON public.service_providers FOR SELECT
  USING ( public.is_admin() OR status = 'approved' OR auth.uid() = owner_id );

  CREATE POLICY "service_providers_update_policy" ON public.service_providers FOR UPDATE
  USING ( public.is_admin() OR auth.uid() = owner_id )
  WITH CHECK ( public.is_admin() OR auth.uid() = owner_id );

  -- Additional duplicate Service Providers policies
  DROP POLICY IF EXISTS "services_delete_policy" ON public.service_providers;
  DROP POLICY IF EXISTS "services_insert_policy" ON public.service_providers;
  DROP POLICY IF EXISTS "services_select_policy" ON public.service_providers;
  DROP POLICY IF EXISTS "services_update_policy" ON public.service_providers;

  CREATE POLICY "services_delete_policy" ON public.service_providers FOR DELETE
  USING ( public.is_admin() OR auth.uid() = owner_id );

  CREATE POLICY "services_insert_policy" ON public.service_providers FOR INSERT
  WITH CHECK ( public.is_admin() OR auth.uid() = owner_id );

  CREATE POLICY "services_select_policy" ON public.service_providers FOR SELECT
  USING ( public.is_admin() OR status = 'approved' OR auth.uid() = owner_id );

  CREATE POLICY "services_update_policy" ON public.service_providers FOR UPDATE
  USING ( public.is_admin() OR auth.uid() = owner_id )
  WITH CHECK ( public.is_admin() OR auth.uid() = owner_id );

  -- Finally, remove duplicate admin policies we noticed previously that we replaced.
  -- "Owners can update own listings" had admin logic baked in.
  DROP POLICY IF EXISTS "Owners can update own listings" ON public.listings;
  DROP POLICY IF EXISTS "Owners can delete own listings" ON public.listings;

  DROP POLICY IF EXISTS "Owners can update own properties" ON public.properties;
  DROP POLICY IF EXISTS "Owners can delete own properties" ON public.properties;

  DROP POLICY IF EXISTS "Owners can update own service providers" ON public.service_providers;
  DROP POLICY IF EXISTS "Owners can delete own service providers" ON public.service_providers;
  DROP POLICY IF EXISTS "Anyone can view approved service providers" ON public.service_providers;
  DROP POLICY IF EXISTS "Users can create service providers" ON public.service_providers;

END $$;
