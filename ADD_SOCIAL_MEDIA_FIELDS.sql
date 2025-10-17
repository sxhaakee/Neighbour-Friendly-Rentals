-- Add social media fields to service_providers table
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_providers' 
AND column_name LIKE '%_url';
