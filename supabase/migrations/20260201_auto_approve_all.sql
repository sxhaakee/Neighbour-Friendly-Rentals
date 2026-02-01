-- Auto-approve all pending listings, services, and properties
-- This will make all existing content appear in the Google Merchant Center feed

-- Auto-approve all listings
UPDATE listings
SET status = 'approved',
    rejection_reason = NULL
WHERE status = 'pending';

-- Auto-approve all service providers
UPDATE service_providers
SET status = 'approved',
    rejection_reason = NULL
WHERE status = 'pending';

-- Auto-approve all properties
UPDATE properties
SET status = 'approved',
    rejection_reason = NULL
WHERE status = 'pending';

-- Log the changes
DO $$
DECLARE
    listings_count INTEGER;
    services_count INTEGER;
    properties_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO listings_count FROM listings WHERE status = 'approved';
    SELECT COUNT(*) INTO services_count FROM service_providers WHERE status = 'approved';
    SELECT COUNT(*) INTO properties_count FROM properties WHERE status = 'approved';
    
    RAISE NOTICE 'Auto-approval complete:';
    RAISE NOTICE '  - Listings approved: %', listings_count;
    RAISE NOTICE '  - Services approved: %', services_count;
    RAISE NOTICE '  - Properties approved: %', properties_count;
END $$;
