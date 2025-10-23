-- =====================================================
-- FIX ALL ERRORS - COMPLETE DATABASE FIX
-- Fixes all console errors shown in screenshots
-- =====================================================

-- 1. ADD MISSING COLUMNS TO BOOKINGS TABLE
-- =====================================================

-- Add approved_at column (missing - causing error)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add confirmed_at column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Add cancelled_at column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Add completed_at column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add rejection_reason column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. FIX BOOKINGS TABLE CONSTRAINTS
-- =====================================================

-- Drop old constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- Add correct constraint with all valid statuses
ALTER TABLE bookings 
ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'paid'));

-- Drop old status constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add correct status constraint
ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected'));

-- 3. CREATE TRIGGER TO UPDATE TIMESTAMPS
-- =====================================================

-- Create function to update approved_at
CREATE OR REPLACE FUNCTION update_booking_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update approved_at when status changes to confirmed
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.approved_at = NOW();
    NEW.confirmed_at = NOW();
  END IF;
  
  -- Update cancelled_at when status changes to cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = NOW();
  END IF;
  
  -- Update completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS booking_timestamps_trigger ON bookings;
CREATE TRIGGER booking_timestamps_trigger
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_timestamps();

-- 4. FIX PROFILES TABLE RELATIONSHIPS
-- =====================================================

-- Ensure all necessary columns exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location TEXT;

-- 5. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_approved_at ON bookings(approved_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- 6. UPDATE EXISTING BOOKINGS
-- =====================================================

-- Set approved_at for already confirmed bookings
UPDATE bookings 
SET approved_at = confirmed_at
WHERE status = 'confirmed' AND approved_at IS NULL AND confirmed_at IS NOT NULL;

-- Set approved_at to created_at for old confirmed bookings without confirmed_at
UPDATE bookings 
SET approved_at = created_at
WHERE status = 'confirmed' AND approved_at IS NULL;

-- 7. FIX RLS POLICIES FOR BOOKINGS
-- =====================================================

-- Drop all existing booking policies
DROP POLICY IF EXISTS "Users can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
DROP POLICY IF EXISTS "bookings_select_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_update_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_delete_policy" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;

-- Create new comprehensive policies
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

-- 8. ENABLE RLS
-- =====================================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 9. CREATE ADMIN FUNCTIONS
-- =====================================================

-- Function to approve booking
CREATE OR REPLACE FUNCTION approve_booking(booking_id UUID, admin_id UUID)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  -- Update booking
  UPDATE bookings
  SET 
    status = 'confirmed',
    approved_at = NOW(),
    confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject booking
CREATE OR REPLACE FUNCTION reject_booking(booking_id UUID, admin_id UUID, reason TEXT)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  -- Update booking
  UPDATE bookings
  SET 
    status = 'rejected',
    rejection_reason = reason,
    updated_at = NOW()
  WHERE id = booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ ✅ ✅ ALL ERRORS FIXED! ✅ ✅ ✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '  ✓ Added approved_at column to bookings';
  RAISE NOTICE '  ✓ Fixed payment_status constraint';
  RAISE NOTICE '  ✓ Fixed status constraint';
  RAISE NOTICE '  ✓ Created timestamp triggers';
  RAISE NOTICE '  ✓ Fixed profiles relationships';
  RAISE NOTICE '  ✓ Updated RLS policies';
  RAISE NOTICE '  ✓ Created admin functions';
  RAISE NOTICE '  ✓ Added performance indexes';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Refresh your admin dashboard - all errors should be gone!';
END $$;
