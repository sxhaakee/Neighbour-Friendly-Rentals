-- =====================================================
-- ADD ADMIN ACCESS TO BOOKINGS TABLE
-- =====================================================
-- This allows admins to view, update, and manage ALL bookings

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;

-- Create admin policy for viewing ALL bookings
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
    OR auth.uid() = renter_id 
    OR auth.uid() = owner_id
  );

-- Create admin policy for updating ALL bookings
CREATE POLICY "Admins can update all bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
    OR auth.uid() = renter_id 
    OR auth.uid() = owner_id
  );

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ ADMIN BOOKINGS POLICIES ADDED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ Admins can now view all bookings';
  RAISE NOTICE '✅ Admins can update all bookings';
  RAISE NOTICE '✅ Regular users can still view their own bookings';
  RAISE NOTICE '==============================================';
END $$;
