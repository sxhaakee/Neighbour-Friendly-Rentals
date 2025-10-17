-- =====================================================
-- FIX ALL SERVICE ISSUES
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. FIX RLS POLICIES FOR SERVICE_PROVIDERS TABLE
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view approved services" ON service_providers;
DROP POLICY IF EXISTS "Users can view their own services" ON service_providers;
DROP POLICY IF EXISTS "Users can create services" ON service_providers;
DROP POLICY IF EXISTS "Users can update their own services" ON service_providers;
DROP POLICY IF EXISTS "Users can delete their own services" ON service_providers;
DROP POLICY IF EXISTS "Admins can view all services" ON service_providers;
DROP POLICY IF EXISTS "Admins can update all services" ON service_providers;
DROP POLICY IF EXISTS "Admins can delete all services" ON service_providers;

-- Create new comprehensive policies
CREATE POLICY "Anyone can view approved services"
  ON service_providers FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view their own services"
  ON service_providers FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all services"
  ON service_providers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create services"
  ON service_providers FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own services"
  ON service_providers FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update all services"
  ON service_providers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own services"
  ON service_providers FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can delete all services"
  ON service_providers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 2. ENSURE TABLE HAS CORRECT STRUCTURE
-- Check if all required columns exist
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'service_providers' AND column_name = 'status') THEN
    ALTER TABLE service_providers ADD COLUMN status TEXT DEFAULT 'pending' 
      CHECK (status IN ('pending', 'approved', 'rejected', 'inactive'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'service_providers' AND column_name = 'owner_id') THEN
    ALTER TABLE service_providers ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'service_providers' AND column_name = 'verified') THEN
    ALTER TABLE service_providers ADD COLUMN verified BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'service_providers' AND column_name = 'featured') THEN
    ALTER TABLE service_providers ADD COLUMN featured BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 3. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_service_providers_status ON service_providers(status);
CREATE INDEX IF NOT EXISTS idx_service_providers_owner_id ON service_providers(owner_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_city ON service_providers(city);
CREATE INDEX IF NOT EXISTS idx_service_providers_created_at ON service_providers(created_at DESC);

-- 4. GRANT PERMISSIONS
GRANT ALL ON service_providers TO authenticated;
GRANT SELECT ON service_providers TO anon;

-- 5. VERIFY THE FIX
DO $$
DECLARE
  policy_count INTEGER;
  admin_count INTEGER;
BEGIN
  -- Check policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'service_providers';
  
  IF policy_count >= 8 THEN
    RAISE NOTICE '✅ SUCCESS: % RLS policies created for service_providers', policy_count;
  ELSE
    RAISE WARNING '⚠️  WARNING: Only % policies found, expected at least 8', policy_count;
  END IF;

  -- Check if admin exists
  SELECT COUNT(*) INTO admin_count
  FROM profiles
  WHERE role = 'admin';
  
  IF admin_count > 0 THEN
    RAISE NOTICE '✅ SUCCESS: % admin user(s) found', admin_count;
  ELSE
    RAISE WARNING '⚠️  WARNING: No admin users found. You may need to set a user as admin.';
  END IF;
END $$;

-- 6. SHOW TABLE STRUCTURE
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'service_providers'
ORDER BY ordinal_position;

-- 7. SHOW ALL POLICIES
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'service_providers';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ SERVICE ISSUES FIXED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ RLS policies updated';
  RAISE NOTICE '✅ Table structure verified';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 Services should now:';
  RAISE NOTICE '   - Show in admin panel';
  RAISE NOTICE '   - Delete properly from dashboard';
  RAISE NOTICE '   - Be visible to public when approved';
  RAISE NOTICE '==============================================';
END $$;
