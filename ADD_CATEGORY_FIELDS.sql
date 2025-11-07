-- Add category field to service_providers table
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add category field to properties table  
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS category TEXT;

-- Update existing services with default categories based on business_name or description
-- You can manually update these later in the admin panel

UPDATE service_providers
SET category = CASE
  WHEN LOWER(business_name) LIKE '%photo%' OR LOWER(description) LIKE '%photo%' THEN 'Photography'
  WHEN LOWER(business_name) LIKE '%video%' OR LOWER(description) LIKE '%video%' THEN 'Videography'
  WHEN LOWER(business_name) LIKE '%cater%' OR LOWER(description) LIKE '%cater%' OR LOWER(description) LIKE '%food%' THEN 'Catering'
  WHEN LOWER(business_name) LIKE '%event%' OR LOWER(description) LIKE '%event%' OR LOWER(description) LIKE '%party%' THEN 'Event Planning'
  WHEN LOWER(business_name) LIKE '%music%' OR LOWER(description) LIKE '%music%' OR LOWER(description) LIKE '%dj%' THEN 'Music & Entertainment'
  WHEN LOWER(business_name) LIKE '%beauty%' OR LOWER(description) LIKE '%beauty%' OR LOWER(description) LIKE '%salon%' THEN 'Beauty & Wellness'
  WHEN LOWER(business_name) LIKE '%home%' OR LOWER(description) LIKE '%repair%' OR LOWER(description) LIKE '%plumb%' THEN 'Home Services'
  ELSE 'Photography'
END
WHERE category IS NULL;

-- Update existing properties with default categories
UPDATE properties
SET category = CASE
  WHEN LOWER(title) LIKE '%apartment%' OR LOWER(description) LIKE '%apartment%' THEN 'Apartment'
  WHEN LOWER(title) LIKE '%house%' OR LOWER(description) LIKE '%house%' THEN 'House'
  WHEN LOWER(title) LIKE '%villa%' OR LOWER(description) LIKE '%villa%' THEN 'Villa'
  WHEN LOWER(title) LIKE '%pg%' OR LOWER(description) LIKE '%paying guest%' THEN 'PG'
  WHEN LOWER(title) LIKE '%hostel%' OR LOWER(description) LIKE '%hostel%' THEN 'Hostel'
  WHEN LOWER(title) LIKE '%room%' OR LOWER(description) LIKE '%room%' THEN 'Room'
  ELSE 'Apartment'
END
WHERE category IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);

-- Verify the changes
SELECT 'Service Providers with categories:' as info, COUNT(*) as count FROM service_providers WHERE category IS NOT NULL;
SELECT 'Properties with categories:' as info, COUNT(*) as count FROM properties WHERE category IS NOT NULL;
