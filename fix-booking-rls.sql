-- ============================================
-- FIX BOOKING RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Owners can view bookings for their listings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can INSERT their own bookings
CREATE POLICY "Users can create their own bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = renter_id);

-- Policy 2: Users can SELECT their own bookings (as renter)
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
TO authenticated
USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Policy 3: Admins can SELECT all bookings
CREATE POLICY "Admins can view all bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy 4: Admins can UPDATE bookings
CREATE POLICY "Admins can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'bookings';
