-- SECURE REVENUE TRACKING POLICIES
-- Run this in Supabase SQL Editor

-- 1. Enable RLS
ALTER TABLE IF EXISTS revenue_tracking ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view all revenue" ON revenue_tracking;
DROP POLICY IF EXISTS "Users can view own revenue" ON revenue_tracking;
DROP POLICY IF EXISTS "Users can insert own revenue" ON revenue_tracking;
DROP POLICY IF EXISTS "Anyone can insert revenue" ON revenue_tracking;

-- 3. Create Admin policy (Full access)
CREATE POLICY "Admins can manage all revenue"
ON revenue_tracking
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 4. Create User policy (Can insert records for themselves)
-- This is critical for the payment handler to work
CREATE POLICY "Authenticated users can insert revenue"
ON revenue_tracking
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 5. Create User policy (Can view their own records)
CREATE POLICY "Users can view own revenue"
ON revenue_tracking
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- 6. Verify table structure while we are here
DO $$ 
BEGIN
    -- Ensure payment_status has correct constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'revenue_tracking' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE revenue_tracking ADD COLUMN payment_status TEXT DEFAULT 'completed';
    END IF;
END $$;
