-- ============================================
-- NEIGHBOURFRIENDLY RENTALS - SAFE MIGRATION FIX
-- This safely handles existing tables and policies
-- ============================================

-- Drop existing policies if they exist (safe approach)
DO $$ 
BEGIN
    -- Drop properties policies
    DROP POLICY IF EXISTS "Anyone can view approved properties" ON properties;
    DROP POLICY IF EXISTS "Owners can view their own properties" ON properties;
    DROP POLICY IF EXISTS "Authenticated users can create properties" ON properties;
    DROP POLICY IF EXISTS "Owners can update their properties" ON properties;
    DROP POLICY IF EXISTS "Admins have full access to properties" ON properties;
    
    -- Drop service provider policies
    DROP POLICY IF EXISTS "Anyone can view approved service providers" ON service_providers;
    DROP POLICY IF EXISTS "Owners can view their service provider profiles" ON service_providers;
    DROP POLICY IF EXISTS "Authenticated users can create service provider profiles" ON service_providers;
    DROP POLICY IF EXISTS "Owners can update their service provider profiles" ON service_providers;
    
    RAISE NOTICE 'Existing policies dropped successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies did not exist, continuing...';
END $$;

-- Recreate RLS policies for properties
CREATE POLICY "Anyone can view approved properties"
  ON properties FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Owners can view their own properties"
  ON properties FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = builder_id);

CREATE POLICY "Authenticated users can create properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = builder_id);

CREATE POLICY "Admins have full access to properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Recreate RLS policies for service providers
CREATE POLICY "Anyone can view approved service providers"
  ON service_providers FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Owners can view their service provider profiles"
  ON service_providers FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create service provider profiles"
  ON service_providers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their service provider profiles"
  ON service_providers FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Verify tables exist
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('properties', 'service_providers', 'service_bookings', 'property_viewings', 'property_inquiries');
  
  RAISE NOTICE '✅ Found % tables', table_count;
  
  IF table_count = 5 THEN
    RAISE NOTICE '✅ SUCCESS! All tables exist and policies are fixed!';
  ELSE
    RAISE NOTICE '⚠️ Only % tables found. Expected 5.', table_count;
  END IF;
END $$;

-- Show table details
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.table_name) as policy_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'service_providers', 'service_bookings', 'property_viewings', 'property_inquiries')
ORDER BY table_name;

-- Final message
SELECT '🎉 Migration fixed! Your database is ready!' as message;
