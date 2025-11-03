-- Add pricing_model column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'per_day' CHECK (pricing_model IN ('per_day', 'per_week', 'per_month', 'per_event', 'per_hour'));

-- Update existing listings to have default pricing_model
UPDATE listings 
SET pricing_model = 'per_day' 
WHERE pricing_model IS NULL;

-- Add comment to column
COMMENT ON COLUMN listings.pricing_model IS 'Pricing model for the listing: per_day, per_week, per_month, per_event, or per_hour';
