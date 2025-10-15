-- ============================================
-- NEIGHBOURFRIENDLY RENTALS - COMPLETE MIGRATION
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- STEP 1: Add address column to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address TEXT;
    RAISE NOTICE 'Address column added to profiles table';
  ELSE
    RAISE NOTICE 'Address column already exists';
  END IF;
END $$;

-- STEP 2: Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic Info
  type TEXT NOT NULL CHECK (type IN ('flat', 'house', 'pg', 'hostel', 'villa', 'commercial', 'office', 'shop', 'warehouse')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  locality TEXT,
  
  -- Pricing
  rent_amount INTEGER NOT NULL,
  deposit_amount INTEGER NOT NULL,
  maintenance_charges INTEGER DEFAULT 0,
  negotiable BOOLEAN DEFAULT false,
  
  -- Property Details
  bedrooms INTEGER,
  bathrooms INTEGER,
  balconies INTEGER DEFAULT 0,
  area_sqft INTEGER NOT NULL,
  floor_number INTEGER,
  total_floors INTEGER,
  age_years INTEGER,
  
  -- Furnishing & Amenities
  furnishing TEXT CHECK (furnishing IN ('furnished', 'semi-furnished', 'unfurnished')),
  amenities TEXT[] DEFAULT '{}',
  
  -- Preferences
  preferred_tenants TEXT[] DEFAULT '{}',
  pets_allowed BOOLEAN DEFAULT false,
  non_veg_allowed BOOLEAN DEFAULT true,
  
  -- Media
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  virtual_tour_url TEXT,
  
  -- Ownership
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  builder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  builder_name TEXT,
  
  -- Availability
  available_from DATE NOT NULL,
  lease_duration TEXT CHECK (lease_duration IN ('11-months', '1-year', '2-years', '3-years', 'flexible')),
  minimum_stay_months INTEGER DEFAULT 11,
  
  -- Status & Verification
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'rented', 'inactive')),
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create service_providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Business Info
  business_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'event-management', 'catering', 'dj', 'decoration', 'photography', 
    'videography', 'shamiyana', 'sound-system', 'lighting', 'mehendi',
    'makeup', 'choreography', 'band', 'anchor', 'security', 'valet-parking'
  )),
  subcategories TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  tagline TEXT,
  
  -- Services & Pricing
  services TEXT[] NOT NULL,
  pricing_model TEXT CHECK (pricing_model IN ('per-event', 'per-hour', 'per-day', 'package', 'custom')),
  base_price INTEGER,
  price_range_min INTEGER,
  price_range_max INTEGER,
  
  -- Location & Coverage
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  service_areas TEXT[] NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  website TEXT,
  
  -- Media
  logo_url TEXT,
  images TEXT[] DEFAULT '{}',
  portfolio_images TEXT[] DEFAULT '{}',
  video_url TEXT,
  
  -- Business Details
  years_experience INTEGER,
  team_size INTEGER,
  equipment_owned TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  
  -- Stats & Ratings
  rating DECIMAL(3, 2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Verification & Status
  verified BOOLEAN DEFAULT false,
  business_license TEXT,
  gst_number TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Create service_bookings table
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  service_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  
  -- Event Details
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  event_duration_hours INTEGER,
  event_location TEXT NOT NULL,
  venue_name TEXT,
  guest_count INTEGER,
  
  -- Requirements
  requirements TEXT NOT NULL,
  special_requests TEXT,
  services_requested TEXT[] DEFAULT '{}',
  
  -- Pricing
  quoted_price INTEGER,
  final_price INTEGER,
  advance_paid INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'advance-paid', 'completed', 'refunded')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'inquiry' CHECK (status IN (
    'inquiry', 'quote-sent', 'negotiating', 'confirmed', 
    'in-progress', 'completed', 'cancelled', 'disputed'
  )),
  
  -- Agreement
  agreement_url TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: Create property_viewings table
CREATE TABLE IF NOT EXISTS property_viewings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  
  viewing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  feedback TEXT,
  interested BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 6: Create property_inquiries table
CREATE TABLE IF NOT EXISTS property_inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  
  message TEXT NOT NULL,
  move_in_date DATE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'viewing-scheduled', 'closed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(rent_amount);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_city ON service_providers(city);

-- STEP 8: Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

-- STEP 9: Create RLS policies for properties
CREATE POLICY "Anyone can view approved properties"
  ON properties FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Owners can view their own properties"
  ON properties FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = builder_id);

CREATE POLICY "Authenticated users can create properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = builder_id);

CREATE POLICY "Admins have full access to properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- STEP 10: Create RLS policies for service providers
CREATE POLICY "Anyone can view approved service providers"
  ON service_providers FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Owners can view their service provider profiles"
  ON service_providers FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create service provider profiles"
  ON service_providers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their service provider profiles"
  ON service_providers FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- STEP 11: Create triggers
CREATE OR REPLACE FUNCTION update_property_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_property_timestamp();

-- STEP 12: Verify installation
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('properties', 'service_providers', 'service_bookings', 'property_viewings', 'property_inquiries');
  
  IF table_count = 5 THEN
    RAISE NOTICE '✅ SUCCESS! All 5 tables created successfully';
  ELSE
    RAISE NOTICE '⚠️ WARNING: Only % tables created. Expected 5.', table_count;
  END IF;
END $$;

-- Show created tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'service_providers', 'service_bookings', 'property_viewings', 'property_inquiries')
ORDER BY table_name;

-- Final success message
SELECT '🚀 Migration Complete! Your database is ready for the expanded platform!' as message;
