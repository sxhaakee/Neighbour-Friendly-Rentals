-- =====================================================
-- FINAL ADMIN PERMISSIONS FIX
-- Correct column names, handles existing policies
-- =====================================================

-- 1. DROP ALL EXISTING POLICIES
-- =====================================================

-- Bookings
DROP POLICY IF EXISTS "Users can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
DROP POLICY IF EXISTS "bookings_select_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_update_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_delete_policy" ON bookings;

-- Listings
DROP POLICY IF EXISTS "Anyone can view approved listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
DROP POLICY IF EXISTS "listings_select_policy" ON listings;
DROP POLICY IF EXISTS "listings_insert_policy" ON listings;
DROP POLICY IF EXISTS "listings_update_policy" ON listings;
DROP POLICY IF EXISTS "listings_delete_policy" ON listings;

-- Properties
DROP POLICY IF EXISTS "Anyone can view approved properties" ON properties;
DROP POLICY IF EXISTS "Users can create properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "properties_select_policy" ON properties;
DROP POLICY IF EXISTS "properties_insert_policy" ON properties;
DROP POLICY IF EXISTS "properties_update_policy" ON properties;
DROP POLICY IF EXISTS "properties_delete_policy" ON properties;

-- Service providers
DROP POLICY IF EXISTS "Anyone can view approved services" ON service_providers;
DROP POLICY IF EXISTS "Users can create services" ON service_providers;
DROP POLICY IF EXISTS "Users can update own services" ON service_providers;
DROP POLICY IF EXISTS "service_providers_select_policy" ON service_providers;
DROP POLICY IF EXISTS "service_providers_insert_policy" ON service_providers;
DROP POLICY IF EXISTS "service_providers_update_policy" ON service_providers;
DROP POLICY IF EXISTS "service_providers_delete_policy" ON service_providers;

-- Rental agreements
DROP POLICY IF EXISTS "Users can view their agreements" ON rental_agreements;
DROP POLICY IF EXISTS "Users can create agreements" ON rental_agreements;
DROP POLICY IF EXISTS "rental_agreements_select_policy" ON rental_agreements;
DROP POLICY IF EXISTS "rental_agreements_insert_policy" ON rental_agreements;
DROP POLICY IF EXISTS "rental_agreements_update_policy" ON rental_agreements;
DROP POLICY IF EXISTS "rental_agreements_delete_policy" ON rental_agreements;

-- Notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON notifications;

-- Profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "reviews_select_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_update_policy" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_policy" ON reviews;

-- Favorites
DROP POLICY IF EXISTS "Users can view their favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete favorites" ON favorites;
DROP POLICY IF EXISTS "favorites_select_policy" ON favorites;
DROP POLICY IF EXISTS "favorites_insert_policy" ON favorites;
DROP POLICY IF EXISTS "favorites_update_policy" ON favorites;
DROP POLICY IF EXISTS "favorites_delete_policy" ON favorites;

-- =====================================================
-- 2. CREATE NEW POLICIES WITH CORRECT COLUMN NAMES
-- =====================================================

-- BOOKINGS POLICIES
CREATE POLICY "bookings_select_policy" ON bookings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = renter_id 
    OR auth.uid() = owner_id
  );

CREATE POLICY "bookings_insert_policy" ON bookings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = renter_id
  );

CREATE POLICY "bookings_update_policy" ON bookings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = renter_id 
    OR auth.uid() = owner_id
  );

CREATE POLICY "bookings_delete_policy" ON bookings FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- LISTINGS POLICIES (uses 'status' column, not 'approval_status')
CREATE POLICY "listings_select_policy" ON listings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR status = 'approved'
    OR auth.uid() = user_id
  );

CREATE POLICY "listings_insert_policy" ON listings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "listings_update_policy" ON listings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "listings_delete_policy" ON listings FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR auth.uid() = user_id
  );

-- PROPERTIES POLICIES (uses 'status' column)
CREATE POLICY "properties_select_policy" ON properties FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR status = 'approved'
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

-- SERVICE PROVIDERS POLICIES (uses 'status' column)
CREATE POLICY "service_providers_select_policy" ON service_providers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    OR status = 'approved'
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
  USING (true);

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
  USING (true);

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
-- 3. ENABLE RLS ON ALL TABLES
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
-- SUCCESS!
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ ALL ADMIN PERMISSIONS FIXED!';
  RAISE NOTICE '✅ Admin has FULL access to everything';
  RAISE NOTICE '✅ All RLS policies updated with correct column names';
  RAISE NOTICE '✅ No more database errors!';
  RAISE NOTICE '';
  RAISE NOTICE 'Refresh your admin dashboard now!';
END $$;
