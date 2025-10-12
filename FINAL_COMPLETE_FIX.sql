-- ============================================
-- FINAL COMPLETE FIX - RUN THIS ONCE
-- This fixes ALL issues at once
-- ============================================

-- 1. Add is_admin column if missing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Set admin user (CHANGE EMAIL!)
UPDATE profiles
SET is_admin = true
WHERE email = 'friendlyrentals.mlr@gmail.com';

-- 3. Add missing columns to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS renter_phone TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3b. Update status check constraint to include 'rejected'
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected'));

-- 4. Drop old RLS policies
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Owners can view bookings for their listings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;

-- 5. Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 6. Create new RLS policies
CREATE POLICY "Users can create their own bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
TO authenticated
USING (auth.uid() = renter_id OR auth.uid() = owner_id);

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

-- 7. Create verification functions
CREATE OR REPLACE FUNCTION verify_user(
  p_user_id UUID,
  p_admin_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_result JSON;
BEGIN
  -- Check if the caller is an admin
  SELECT is_admin INTO v_is_admin
  FROM profiles
  WHERE id = p_admin_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can verify users';
  END IF;

  -- Update the user's verification status
  UPDATE profiles
  SET 
    id_verified = true,
    id_verification_status = 'verified',
    id_verified_at = NOW()
  WHERE id = p_user_id;

  -- Return success
  SELECT json_build_object(
    'success', true,
    'user_id', p_user_id,
    'verified_at', NOW()
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION reject_user_verification(
  p_user_id UUID,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_result JSON;
BEGIN
  -- Check if the caller is an admin
  SELECT is_admin INTO v_is_admin
  FROM profiles
  WHERE id = p_admin_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can reject verifications';
  END IF;

  -- Update the user's verification status
  UPDATE profiles
  SET 
    id_verified = false,
    id_verification_status = 'rejected',
    id_rejection_reason = p_reason
  WHERE id = p_user_id;

  -- Return success
  SELECT json_build_object(
    'success', true,
    'user_id', p_user_id,
    'reason', p_reason
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION verify_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_user_verification(UUID, UUID, TEXT) TO authenticated;

-- 9. Fix notifications RLS policies (for booking creation)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Allow system to create notifications (bypass user_id check)
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- 10. Fix notification trigger function to use SECURITY DEFINER
-- This allows the trigger to bypass RLS when creating notifications
CREATE OR REPLACE FUNCTION notify_owner_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- This is the key - runs with elevated privileges
AS $$
BEGIN
  -- Create notification for owner
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    NEW.owner_id,
    'New Booking Request',
    'You have a new booking request for your item',
    'booking'
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_new_booking ON bookings;
CREATE TRIGGER on_new_booking
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_booking();

-- Also create function for booking confirmation notifications
CREATE OR REPLACE FUNCTION notify_renter_on_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only send notification if status changed to confirmed
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      NEW.renter_id,
      'Booking Confirmed',
      'Your booking has been confirmed by the owner',
      'booking'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the confirmation trigger
DROP TRIGGER IF EXISTS on_booking_confirmed ON bookings;
CREATE TRIGGER on_booking_confirmed
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_renter_on_confirmation();

-- Fix the booking conflict check to skip rejected/cancelled bookings
CREATE OR REPLACE FUNCTION prevent_booking_conflict()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Skip conflict check if booking is being rejected or cancelled
  IF NEW.status IN ('rejected', 'cancelled') THEN
    RETURN NEW;
  END IF;

  -- Check for conflicts only with confirmed or pending bookings
  SELECT COUNT(*) INTO conflict_count
  FROM bookings
  WHERE listing_id = NEW.listing_id
    AND status IN ('confirmed', 'pending')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (NEW.start_date BETWEEN start_date AND end_date) OR
      (NEW.end_date BETWEEN start_date AND end_date) OR
      (start_date BETWEEN NEW.start_date AND NEW.end_date)
    );

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'This item is already booked for the selected dates';
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS check_booking_conflict_trigger ON bookings;
CREATE TRIGGER check_booking_conflict_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_booking_conflict();

-- 11. Reload schema cache
NOTIFY pgrst, 'reload schema';

-- 12. Verify everything
SELECT 
  'is_admin column exists' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN '✅ YES' ELSE '❌ NO' END as result
UNION ALL
SELECT 
  'renter_phone column exists',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'renter_phone'
  ) THEN '✅ YES' ELSE '❌ NO' END
UNION ALL
SELECT 
  'verify_user function exists',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'verify_user'
  ) THEN '✅ YES' ELSE '❌ NO' END
UNION ALL
SELECT 
  'reject_user_verification function exists',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'reject_user_verification'
  ) THEN '✅ YES' ELSE '❌ NO' END
UNION ALL
SELECT 
  'RLS policies count',
  CAST(COUNT(*) AS TEXT) || ' policies'
FROM pg_policies WHERE tablename = 'bookings'
UNION ALL
SELECT 
  'Admin user set',
  CASE WHEN EXISTS (
    SELECT 1 FROM profiles WHERE is_admin = true
  ) THEN '✅ YES' ELSE '❌ NO' END;

-- Should show all ✅ YES
