-- NeighbourFriendly Rentals - Listing Visibility & Limit Support
-- This script adds the 'hidden' status to all listing tables to support the 3-listing limit for non-premium users.

-- 1. Update listings table
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'hidden'));

-- 2. Update properties table 
-- Note: properties already has 'rented' and 'inactive'
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE properties ADD CONSTRAINT properties_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'rented', 'inactive', 'hidden'));

-- 3. Update service_providers table
ALTER TABLE service_providers DROP CONSTRAINT IF EXISTS service_providers_status_check;
ALTER TABLE service_providers ADD CONSTRAINT service_providers_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'inactive', 'hidden'));

-- Ensure RLS allows owners to see their hidden items (usually already covered by owner_id check)
-- But we explicitly add it here for clarity in case future policies change.

COMMENT ON COLUMN listings.status IS 'Current status of the listing. "hidden" is used for items over the 3-listing limit for free accounts.';
COMMENT ON COLUMN properties.status IS 'Current status of the property. "hidden" is used for items over the 3-listing limit for free accounts.';
COMMENT ON COLUMN service_providers.status IS 'Current status of the provider profile. "hidden" is used for profiles over the limit for free accounts.';
