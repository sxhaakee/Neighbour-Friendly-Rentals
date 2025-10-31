-- Add Missing Columns to Revenue Tracking Table
-- Run this in Supabase SQL Editor

-- First, check if revenue_tracking table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'revenue_tracking'
);

-- Check what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'revenue_tracking' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to revenue_tracking
DO $$ 
BEGIN
    -- Add payment_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'revenue_tracking' 
        AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE revenue_tracking ADD COLUMN payment_id TEXT;
        RAISE NOTICE 'Added payment_id column';
    END IF;

    -- Add payment_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'revenue_tracking' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE revenue_tracking ADD COLUMN payment_status TEXT 
        CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
        RAISE NOTICE 'Added payment_status column';
    END IF;

    -- Add booking_id column (for rental payments)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'revenue_tracking' 
        AND column_name = 'booking_id'
    ) THEN
        ALTER TABLE revenue_tracking ADD COLUMN booking_id UUID;
        RAISE NOTICE 'Added booking_id column';
    END IF;

    -- Add listing_id column (for featured listing payments)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'revenue_tracking' 
        AND column_name = 'listing_id'
    ) THEN
        ALTER TABLE revenue_tracking ADD COLUMN listing_id UUID;
        RAISE NOTICE 'Added listing_id column';
    END IF;
END $$;

-- Verify all columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'revenue_tracking' 
AND column_name IN ('payment_id', 'payment_status', 'booking_id', 'listing_id')
ORDER BY column_name;

-- Now you can check revenue records
SELECT 
  id,
  revenue_type,
  amount,
  payment_id,
  payment_status,
  description,
  created_at
FROM revenue_tracking
ORDER BY created_at DESC
LIMIT 10;
