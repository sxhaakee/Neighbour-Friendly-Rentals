-- ============================================
-- CREATE RENTAL AGREEMENTS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create rental_agreements table
CREATE TABLE IF NOT EXISTS rental_agreements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  renter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Agreement Details
  agreement_data JSONB NOT NULL, -- Stores full agreement details
  pdf_url TEXT, -- URL to stored PDF (if uploaded to storage)
  
  -- Parties Information
  renter_name TEXT NOT NULL,
  renter_email TEXT NOT NULL,
  renter_phone TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  
  -- Item Details
  item_title TEXT NOT NULL,
  item_description TEXT,
  
  -- Rental Details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  security_deposit DECIMAL(10, 2) DEFAULT 0,
  
  -- Agreement Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'disputed')),
  agreed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  
  -- Unique constraint
  UNIQUE(booking_id)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rental_agreements_booking ON rental_agreements(booking_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_renter ON rental_agreements(renter_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_owner ON rental_agreements(owner_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_status ON rental_agreements(status);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_dates ON rental_agreements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_deleted ON rental_agreements(deleted_at) WHERE deleted_at IS NULL;

-- 3. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_rental_agreements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rental_agreements_updated_at
  BEFORE UPDATE ON rental_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_agreements_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Admin can view all agreements (including soft-deleted)
CREATE POLICY "Admins can view all rental agreements"
  ON rental_agreements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can view their own agreements (not deleted)
CREATE POLICY "Users can view their own rental agreements"
  ON rental_agreements
  FOR SELECT
  TO authenticated
  USING (
    (renter_id = auth.uid() OR owner_id = auth.uid())
    AND deleted_at IS NULL
  );

-- System can insert agreements
CREATE POLICY "System can create rental agreements"
  ON rental_agreements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    renter_id = auth.uid() OR owner_id = auth.uid()
  );

-- Admin can update agreements
CREATE POLICY "Admins can update rental agreements"
  ON rental_agreements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can soft delete agreements
CREATE POLICY "Admins can delete rental agreements"
  ON rental_agreements
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

-- 6. Create view for active agreements (excludes soft-deleted)
CREATE OR REPLACE VIEW active_rental_agreements AS
SELECT *
FROM rental_agreements
WHERE deleted_at IS NULL;

-- 7. Create view for admin with all details
CREATE OR REPLACE VIEW admin_rental_agreements AS
SELECT 
  ra.*,
  renter.full_name as renter_full_name,
  renter.email as renter_user_email,
  owner.full_name as owner_full_name,
  owner.email as owner_user_email,
  l.title as listing_title,
  l.images as listing_images,
  b.status as booking_status,
  b.payment_status
FROM rental_agreements ra
LEFT JOIN profiles renter ON ra.renter_id = renter.id
LEFT JOIN profiles owner ON ra.owner_id = owner.id
LEFT JOIN listings l ON ra.listing_id = l.id
LEFT JOIN bookings b ON ra.booking_id = b.id;

-- 8. Verification query
SELECT 
  'rental_agreements table exists' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'rental_agreements'
  ) THEN 'YES ✅' ELSE 'NO ❌' END as result
UNION ALL
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'rental_agreements' 
    AND rowsecurity = true
  ) THEN 'YES ✅' ELSE 'NO ❌' END
UNION ALL
SELECT 
  'RLS policies count',
  CAST(COUNT(*) AS TEXT) || ' policies'
FROM pg_policies WHERE tablename = 'rental_agreements'
UNION ALL
SELECT 
  'Indexes count',
  CAST(COUNT(*) AS TEXT) || ' indexes'
FROM pg_indexes WHERE tablename = 'rental_agreements';

-- Should show all ✅ YES
