-- FINAL FIX for Payment Status Update
-- Run this in Supabase SQL Editor

-- 1. Drop the problematic check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- 2. Ensure payment_status column exists with correct type
DO $$ 
BEGIN
  -- Check if column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    -- Add column if it doesn't exist
    ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- 3. Add proper check constraint with correct values
ALTER TABLE bookings 
ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('pending', 'completed', 'failed'));

-- 4. Update any existing NULL values to 'pending'
UPDATE bookings 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;

-- 5. Drop all existing admin policies for bookings
DROP POLICY IF EXISTS "Admins can update payment status" ON bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
DROP POLICY IF EXISTS "Admin full access" ON bookings;

-- 6. Create comprehensive admin policy
CREATE POLICY "Admin full access to bookings"
ON bookings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 7. Ensure users can view their own bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;

CREATE POLICY "Users can view own bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  auth.uid() = renter_id OR auth.uid() = owner_id
);

-- 8. Test the update (replace with actual booking ID)
-- SELECT id, payment_status FROM bookings LIMIT 5;

-- 9. Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;
