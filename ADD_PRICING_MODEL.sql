-- Add pricing_model column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS pricing_model text DEFAULT 'per_month';

-- Update existing rows to have a default value
UPDATE public.properties 
SET pricing_model = 'per_month' 
WHERE pricing_model IS NULL;
