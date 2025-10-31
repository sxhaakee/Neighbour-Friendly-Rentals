-- Add Missing Premium Columns to Profiles Table
-- Run this in Supabase SQL Editor

-- First, let's check what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing premium columns if they don't exist
DO $$ 
BEGIN
    -- Add premium_payment_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'premium_payment_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN premium_payment_id TEXT;
        RAISE NOTICE 'Added premium_payment_id column';
    END IF;

    -- Add premium_plan column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'premium_plan'
    ) THEN
        ALTER TABLE profiles ADD COLUMN premium_plan TEXT CHECK (premium_plan IN ('monthly', 'yearly'));
        RAISE NOTICE 'Added premium_plan column';
    END IF;

    -- Add premium_expires_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'premium_expires_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN premium_expires_at TIMESTAMPTZ;
        RAISE NOTICE 'Added premium_expires_at column';
    END IF;

    -- Make sure is_premium exists and has default
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_premium'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_premium column';
    ELSE
        -- Set default if not set
        ALTER TABLE profiles ALTER COLUMN is_premium SET DEFAULT FALSE;
        RAISE NOTICE 'Updated is_premium default';
    END IF;
END $$;

-- Verify all columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('is_premium', 'premium_plan', 'premium_expires_at', 'premium_payment_id')
ORDER BY column_name;

-- Now you can check your premium status
SELECT 
  id,
  email,
  full_name,
  is_premium,
  premium_plan,
  premium_expires_at,
  premium_payment_id
FROM profiles
WHERE email = 'sheriefshakeeb313@gmail.com';  -- Replace with YOUR email
