-- Fix Payment Status Update Permissions
-- Run this in Supabase SQL Editor

-- 1. First, check if payment_status column exists
-- If not, add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- 2. Add RLS policy for admins to update payment_status
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can update payment status" ON bookings;

-- Create new policy
CREATE POLICY "Admins can update payment status"
ON bookings
FOR UPDATE
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

-- 3. Also ensure admins can update booking status for cancellation
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;

CREATE POLICY "Admins can update bookings"
ON bookings
FOR UPDATE
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

-- 4. Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

-- 5. Test query (should return your bookings if you're admin)
SELECT id, payment_status, status 
FROM bookings 
LIMIT 5;
