-- NeighbourFriendly Rentals - Expansion Schema
-- Properties & Services Marketplace
-- Run this in Supabase SQL Editor

-- ============================================
-- PROPERTIES SECTION
-- ============================================

-- Properties Table (Flats, Houses, PG, Commercial)
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
  locality TEXT, -- Area name like "Koramangala", "Indiranagar"
  
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
  age_years INTEGER, -- Age of property
  
  -- Furnishing & Amenities
  furnishing TEXT CHECK (furnishing IN ('furnished', 'semi-furnished', 'unfurnished')),
  amenities TEXT[] DEFAULT '{}', -- ['parking', 'gym', 'pool', 'security', 'lift', 'power-backup', 'wifi']
  
  -- Preferences
  preferred_tenants TEXT[], -- ['family', 'bachelor', 'students', 'company']
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
  builder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- If listed by builder
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

-- Property Viewings Table
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

-- Property Inquiries Table
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

-- ============================================
-- SERVICE PROVIDERS SECTION
-- ============================================

-- Service Providers Table
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Business Info
  business_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'event-management', 'catering', 'dj', 'decoration', 'photography', 
    'videography', 'shamiyana', 'sound-system', 'lighting', 'mehendi',
    'makeup', 'choreography', 'band', 'anchor', 'security', 'valet-parking'
  )),
  subcategories TEXT[] DEFAULT '{}', -- ['wedding', 'birthday', 'corporate', 'religious']
  description TEXT NOT NULL,
  tagline TEXT,
  
  -- Services & Pricing
  services TEXT[] NOT NULL, -- ['wedding-planning', 'birthday-decoration', 'corporate-events']
  pricing_model TEXT CHECK (pricing_model IN ('per-event', 'per-hour', 'per-day', 'package', 'custom')),
  base_price INTEGER,
  price_range_min INTEGER,
  price_range_max INTEGER,
  
  -- Location & Coverage
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  service_areas TEXT[] NOT NULL, -- ['Bangalore', 'Mysore', 'Mandya']
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
  equipment_owned TEXT[], -- ['sound-system', 'lights', 'stage']
  certifications TEXT[],
  
  -- Stats & Ratings
  rating DECIMAL(3, 2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Verification & Status
  verified BOOLEAN DEFAULT false,
  business_license TEXT, -- License number
  gst_number TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Bookings Table
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  service_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  
  -- Event Details
  event_type TEXT NOT NULL, -- 'wedding', 'birthday', 'corporate'
  event_date DATE NOT NULL,
  event_time TIME,
  event_duration_hours INTEGER,
  event_location TEXT NOT NULL,
  venue_name TEXT,
  guest_count INTEGER,
  
  -- Requirements
  requirements TEXT NOT NULL,
  special_requests TEXT,
  services_requested TEXT[], -- Specific services from provider
  
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

-- Service Reviews Table
CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES service_bookings(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Rating Breakdown
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Properties Indexes
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(rent_amount);
CREATE INDEX IF NOT EXISTS idx_properties_available_from ON properties(available_from);

-- Service Providers Indexes
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_city ON service_providers(city);
CREATE INDEX IF NOT EXISTS idx_service_providers_status ON service_providers(status);
CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON service_providers(rating);

-- Service Bookings Indexes
CREATE INDEX IF NOT EXISTS idx_service_bookings_event_date ON service_bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

-- Properties Policies
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

-- Service Providers Policies
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

-- Service Bookings Policies
CREATE POLICY "Users can view their own bookings"
  ON service_bookings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = customer_id OR 
    auth.uid() IN (SELECT owner_id FROM service_providers WHERE id = service_provider_id)
  );

CREATE POLICY "Users can create bookings"
  ON service_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update property updated_at timestamp
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

-- Update service provider rating
CREATE OR REPLACE FUNCTION update_service_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_providers
  SET rating = (
    SELECT AVG(rating)::DECIMAL(3,2)
    FROM service_reviews
    WHERE service_provider_id = NEW.service_provider_id
  )
  WHERE id = NEW.service_provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_review_rating_update
  AFTER INSERT OR UPDATE ON service_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_service_provider_rating();

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'property_viewings', 'property_inquiries', 'service_providers', 'service_bookings', 'service_reviews')
ORDER BY table_name;

-- Success message
SELECT 'Expansion schema created successfully! 🚀' AS message;
