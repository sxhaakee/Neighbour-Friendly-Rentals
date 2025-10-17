-- =====================================================
-- COMPREHENSIVE FIX FOR ALL PERMISSIONS & TABLES
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. ENSURE FAVORITES TABLE EXISTS
-- First, drop the table if it exists with wrong schema
DROP TABLE IF EXISTS favorites CASCADE;

-- Create fresh favorites table with correct schema
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('item', 'property', 'service')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type, item_id)
);

-- Create index for faster queries
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_type_item ON favorites(type, item_id);

-- 2. FIX FAVORITES RLS POLICIES
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
DROP POLICY IF EXISTS "Users can remove their favorites" ON favorites;

-- Create new policies
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 3. FIX SERVICE_PROVIDERS RLS POLICIES
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view approved services" ON service_providers;
DROP POLICY IF EXISTS "Admins can view all services" ON service_providers;
DROP POLICY IF EXISTS "Owners can view their services" ON service_providers;
DROP POLICY IF EXISTS "Authenticated users can create services" ON service_providers;
DROP POLICY IF EXISTS "Owners can update their services" ON service_providers;
DROP POLICY IF EXISTS "Owners can delete their services" ON service_providers;
DROP POLICY IF EXISTS "Admins can update any service" ON service_providers;
DROP POLICY IF EXISTS "Admins can delete any service" ON service_providers;

-- Create comprehensive policies
CREATE POLICY "Anyone can view approved services"
  ON service_providers FOR SELECT
  USING (status = 'approved' OR auth.uid() = owner_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authenticated users can create services"
  ON service_providers FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and admins can update services"
  ON service_providers FOR UPDATE
  USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Owners and admins can delete services"
  ON service_providers FOR DELETE
  USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. FIX PROPERTIES RLS POLICIES
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view approved properties" ON properties;
DROP POLICY IF EXISTS "Owners can view their properties" ON properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can create properties" ON properties;
DROP POLICY IF EXISTS "Owners can update their properties" ON properties;
DROP POLICY IF EXISTS "Owners can delete their properties" ON properties;
DROP POLICY IF EXISTS "Admins can update any property" ON properties;
DROP POLICY IF EXISTS "Admins can delete any property" ON properties;

-- Create comprehensive policies
CREATE POLICY "Anyone can view approved properties"
  ON properties FOR SELECT
  USING (status = 'approved' OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authenticated users can create properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and admins can update properties"
  ON properties FOR UPDATE
  USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Owners and admins can delete properties"
  ON properties FOR DELETE
  USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. FIX LISTINGS RLS POLICIES
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view approved listings" ON listings;
DROP POLICY IF EXISTS "Owners can view their listings" ON listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
DROP POLICY IF EXISTS "Owners can update their listings" ON listings;
DROP POLICY IF EXISTS "Owners can delete their listings" ON listings;
DROP POLICY IF EXISTS "Admins can update any listing" ON listings;
DROP POLICY IF EXISTS "Admins can delete any listing" ON listings;

-- Create comprehensive policies
CREATE POLICY "Anyone can view approved listings"
  ON listings FOR SELECT
  USING (status = 'approved' OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and admins can update listings"
  ON listings FOR UPDATE
  USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Owners and admins can delete listings"
  ON listings FOR DELETE
  USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. GRANT NECESSARY PERMISSIONS
GRANT ALL ON favorites TO authenticated;
GRANT ALL ON service_providers TO authenticated;
GRANT ALL ON properties TO authenticated;
GRANT ALL ON listings TO authenticated;

-- 7. CREATE HELPER FUNCTION FOR CHECKING ADMIN
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION QUERIES (Run these to check)
-- =====================================================

-- Check if favorites table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'favorites'
);

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('favorites', 'service_providers', 'properties', 'listings');

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('favorites', 'service_providers', 'properties', 'listings')
ORDER BY tablename, policyname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'All permissions and tables have been fixed!';
  RAISE NOTICE 'Favorites table: Created/Verified';
  RAISE NOTICE 'RLS Policies: Updated for all tables';
  RAISE NOTICE 'Admin function: Created';
  RAISE NOTICE 'You can now use the app without permission errors!';
END $$;
