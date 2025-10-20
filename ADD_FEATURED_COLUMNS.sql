-- ============================================
-- ADD FEATURED COLUMNS TO ALL TABLES
-- ============================================
-- This script adds 'featured' boolean columns to:
-- 1. listings (items)
-- 2. service_providers (services)
-- 3. properties
-- 
-- Admin can toggle these to show items on home page
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🚀 Adding Featured Columns';
  RAISE NOTICE '==============================================';

  -- Add featured column to listings (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'featured'
  ) THEN
    ALTER TABLE listings ADD COLUMN featured BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Added featured column to listings';
  ELSE
    RAISE NOTICE '⏭️  Featured column already exists in listings';
  END IF;

  -- Add featured column to service_providers (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'service_providers' AND column_name = 'featured'
  ) THEN
    ALTER TABLE service_providers ADD COLUMN featured BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Added featured column to service_providers';
  ELSE
    RAISE NOTICE '⏭️  Featured column already exists in service_providers';
  END IF;

  -- Add featured column to properties (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'featured'
  ) THEN
    ALTER TABLE properties ADD COLUMN featured BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Added featured column to properties';
  ELSE
    RAISE NOTICE '⏭️  Featured column already exists in properties';
  END IF;

  -- Create indexes for faster featured queries (only if columns exist)
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured) WHERE featured = TRUE;
    RAISE NOTICE '✅ Created index for listings.featured';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Could not create index for listings.featured';
  END;
  
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_service_providers_featured ON service_providers(featured) WHERE featured = TRUE;
    RAISE NOTICE '✅ Created index for service_providers.featured';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Could not create index for service_providers.featured';
  END;
  
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured) WHERE featured = TRUE;
    RAISE NOTICE '✅ Created index for properties.featured';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Could not create index for properties.featured';
  END;

  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 Featured columns added successfully!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📝 NEXT STEPS:';
  RAISE NOTICE '1. Go to Admin Panel';
  RAISE NOTICE '2. Toggle "Featured" for items you want on home page';
  RAISE NOTICE '3. Featured items will appear on home page';
  RAISE NOTICE '==============================================';
END $$;
