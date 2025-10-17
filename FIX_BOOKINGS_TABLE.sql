-- =====================================================
-- FIX BOOKINGS TABLE - Rename item_id to listing_id
-- =====================================================

-- Option 1: If table exists, rename the column
DO $$
BEGIN
  -- Check if bookings table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
    -- Check if item_id column exists
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name = 'item_id'
    ) THEN
      -- Rename item_id to listing_id
      ALTER TABLE bookings RENAME COLUMN item_id TO listing_id;
      RAISE NOTICE '✅ Renamed item_id to listing_id in bookings table';
    ELSE
      RAISE NOTICE 'ℹ️ Column item_id does not exist, skipping rename';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️ Bookings table does not exist, will be created by Phase 1 migration';
  END IF;
END $$;

-- Option 2: If you prefer to drop and recreate (CAUTION: This deletes all booking data!)
-- Uncomment the lines below if you want to start fresh

/*
DROP TABLE IF EXISTS bookings CASCADE;

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  service_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_price DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  notes TEXT,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected')),
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES auth.users(id),
  cancelled_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT booking_target_check CHECK (
    (listing_id IS NOT NULL AND property_id IS NULL AND service_id IS NULL) OR
    (listing_id IS NULL AND property_id IS NOT NULL AND service_id IS NULL) OR
    (listing_id IS NULL AND property_id IS NULL AND service_id IS NOT NULL)
  ),
  CONSTRAINT booking_dates_check CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users can update their bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Create indexes
CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_renter ON bookings(renter_id);
CREATE INDEX idx_bookings_owner ON bookings(owner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- Grant permissions
GRANT ALL ON bookings TO authenticated;
*/

-- Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'listing_id'
  ) THEN
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ BOOKINGS TABLE FIXED!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ Column listing_id exists';
    RAISE NOTICE '✅ Ready to use';
    RAISE NOTICE '==============================================';
  END IF;
END $$;
