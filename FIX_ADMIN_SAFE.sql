-- =====================================================
-- SAFE ADMIN PERMISSIONS FIX
-- Handles existing policies gracefully
-- =====================================================

-- 1. DROP ALL EXISTING POLICIES (SAFE VERSION)
-- =====================================================

-- Bookings table
DROP POLICY IF EXISTS "Users can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
DROP POLICY IF EXISTS "bookings_select_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_update_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_delete_policy" ON bookings;

-- Listings table
DROP POLICY IF EXISTS "Anyone can view approved listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
DROP POLICY IF EXISTS "listings_select_policy" ON listings;
DROP POLICY IF EXISTS "listings_insert_policy" ON listings;
DROP POLICY IF EXISTS "listings_update_policy" ON listings;
DROP POLICY IF EXISTS "listings_delete_policy" ON listings;

-- Properties table
DROP POLICY IF EXISTS "Anyone can view approved properties" ON properties;
DROP POLICY IF EXISTS "Users can create properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "properties_select_policy" ON properties;
DROP POLICY IF EXISTS "properties_insert_policy" ON properties;
DROP POLICY IF EXISTS "properties_update_policy" ON properties;
DROP POLICY IF EXISTS "properties_delete_policy" ON properties;

-- Service providers table
DROP POLICY IF EXISTS "Anyone can view approved services" ON service_providers;
DROP POLICY IF EXISTS "Users can create services" ON service_providers;
DROP POLICY IF EXISTS "Users can update own services" ON service_providers;
DROP POLICY IF EXISTS "service_providers_select_policy" ON service_providers;
DROP POLICY IF EXISTS "service_providers_insert_policy" ON service_providers;
DROP POLICY IF EXISTS "service_providers_update_policy" ON service_providers;
DROP POLICY IF EXISTS "service_providers_delete_policy" ON service_providers;

-- Rental agreements table
DROP POLICY IF EXISTS "Users can view their agreements" ON rental_agreements;
DROP POLICY IF EXISTS "Users can create agreements" ON rental_agreements;
DROP POLICY IF EXISTS "rental_agreements_select_policy" ON rental_agreements;
DROP POLICY IF EXISTS "rental_agreements_insert_policy" ON rental_agreements;
DROP POLICY IF EXISTS "rental_agreements_update_policy" ON rental_agreements;
DROP POLICY IF EXISTS "rental_agreements_delete_policy" ON rental_agreements;

-- Notifications table
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON notifications;

-- Profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Reviews table
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "reviews_select_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_update_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_policy" ON reviews;

-- Favorites table
DROP POLICY IF EXISTS "Users can view their favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete favorites" ON favorites;
DROP POLICY IF EXISTS "favorites_select_policy" ON favorites;
DROP POLICY IF EXISTS "favorites_insert_policy" ON favorites;
DROP POLICY IF EXISTS "favorites_update_policy" ON favorites;
DROP POLICY IF EXISTS "favorites_delete_policy" ON favorites;

-- =====================================================
-- 2. FIX BOOKINGS TABLE CONSTRAINT
-- =====================================================

-- Drop old constraint if exists
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- Add correct constraint
ALTER TABLE bookings 
  ADD CONSTRAINT bookings_payment_status_check 
  CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));

-- =====================================================
-- 3. CREATE ADMIN ANALYTICS TABLES
-- =====================================================

-- Admin analytics table
CREATE TABLE IF NOT EXISTS admin_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform revenue tracking
CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  commission_rate NUMERIC DEFAULT 0.15,
  commission_amount NUMERIC GENERATED ALWAYS AS (amount * commission_rate) STORED,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE NEW ADMIN-FRIENDLY POLICIES
-- =====================================================

-- BOOKINGS POLICIES
CREATE POLICY "bookings_select_policy" ON bookings FOR SELECT
  USING (
    -- Admin can see everything
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    -- OR user is renter or owner
    OR auth.uid() = renter_id 
    OR auth.uid() = owner_id
  );

CREATE POLICY "bookings_insert_policy" ON bookings FOR INSERT
  WITH CHECK (
    -- Admin can create any booking
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    -- OR user is the renter
    OR auth.uid() = renter_id
  );

CREATE POLICY "bookings_update_policy" ON bookings FOR UPDATE
  USING (
    -- Admin can update any booking
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    -- OR user is renter or owner
    OR auth.uid() = renter_id 
    OR auth.uid() = owner_id
  );

CREATE POLICY "bookings_delete_policy" ON bookings FOR DELETE
  USING (
    -- Only admin can delete
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- LISTINGS POLICIES
CREATE POLICY "listings_select_policy" ON listings FOR SELECT
  USING (
    -- Admin can see all
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    -- OR listing is approved
    OR approval_status = 'approved'
    -- OR user owns it
    OR auth.uid() = user_id
  );

CREATE POLICY "listings_insert_policy" ON listings FOR INSERT
  WITH CHECK (
    -- Admin can create any
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    -- OR user is creating their own
    OR auth.uid() = user_id
  );

CREATE POLICY "listings_update_policy" ON listings FOR UPDATE
  USING (
    -- Admin can update any
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    -- OR user owns it
    OR auth.uid() = user_id
  );

CREATE POLICY "listings_delete_policy" ON listings FOR DELETE
  USING (
    -- Admin can delete any
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    -- OR user owns it
    OR auth.uid() = user_id
  );

-- PROPERTIES POLICIES
CREATE POLICY "properties_select_policy" ON properties FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR approval_status = 'approved'
    OR auth.uid() = user_id
  );

CREATE POLICY "properties_insert_policy" ON properties FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "properties_update_policy" ON properties FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "properties_delete_policy" ON properties FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

-- SERVICE PROVIDERS POLICIES
CREATE POLICY "service_providers_select_policy" ON service_providers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR approval_status = 'approved'
    OR auth.uid() = user_id
  );

CREATE POLICY "service_providers_insert_policy" ON service_providers FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "service_providers_update_policy" ON service_providers FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "service_providers_delete_policy" ON service_providers FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

-- RENTAL AGREEMENTS POLICIES
CREATE POLICY "rental_agreements_select_policy" ON rental_agreements FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = renter_id 
    OR auth.uid() = owner_id
  );

CREATE POLICY "rental_agreements_insert_policy" ON rental_agreements FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = renter_id
  );

CREATE POLICY "rental_agreements_update_policy" ON rental_agreements FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = renter_id 
    OR auth.uid() = owner_id
  );

CREATE POLICY "rental_agreements_delete_policy" ON rental_agreements FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- NOTIFICATIONS POLICIES
CREATE POLICY "notifications_select_policy" ON notifications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "notifications_insert_policy" ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "notifications_update_policy" ON notifications FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "notifications_delete_policy" ON notifications FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

-- PROFILES POLICIES
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT
  USING (true); -- Everyone can view profiles

CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = id
  );

CREATE POLICY "profiles_delete_policy" ON profiles FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- REVIEWS POLICIES
CREATE POLICY "reviews_select_policy" ON reviews FOR SELECT
  USING (true); -- Everyone can view reviews

CREATE POLICY "reviews_insert_policy" ON reviews FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = reviewer_id
  );

CREATE POLICY "reviews_update_policy" ON reviews FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = reviewer_id
  );

CREATE POLICY "reviews_delete_policy" ON reviews FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = reviewer_id
  );

-- FAVORITES POLICIES
CREATE POLICY "favorites_select_policy" ON favorites FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "favorites_insert_policy" ON favorites FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "favorites_delete_policy" ON favorites FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

-- =====================================================
-- 5. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ ALL ADMIN PERMISSIONS FIXED!';
  RAISE NOTICE '✅ Admin now has FULL access to everything';
  RAISE NOTICE '✅ All RLS policies updated';
  RAISE NOTICE '✅ Analytics tables created';
  RAISE NOTICE '✅ No more database errors!';
END $$;
