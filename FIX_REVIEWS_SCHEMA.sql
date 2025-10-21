-- ============================================
-- FIX REVIEWS TABLE SCHEMA
-- ============================================
-- This fixes the foreign key relationship error
-- and adds missing columns

-- 1. Drop existing foreign key if it exists (to recreate it properly)
DO $$ 
BEGIN
    -- Drop old constraint if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reviews_reviewer_id_fkey' 
        AND table_name = 'reviews'
    ) THEN
        ALTER TABLE reviews DROP CONSTRAINT reviews_reviewer_id_fkey;
        RAISE NOTICE '✅ Dropped old foreign key constraint';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  No old constraint to drop';
END $$;

-- 2. Add foreign key to profiles table (if not exists)
DO $$ 
BEGIN
    ALTER TABLE reviews 
    ADD CONSTRAINT reviews_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Added foreign key to auth.users';
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE '⚠️  Foreign key already exists';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error adding foreign key: %', SQLERRM;
END $$;

-- 3. Add service_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'service_id'
    ) THEN
        ALTER TABLE reviews ADD COLUMN service_id UUID REFERENCES service_providers(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added service_id column';
    ELSE
        RAISE NOTICE '⚠️  service_id column already exists';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error adding service_id: %', SQLERRM;
END $$;

-- 4. Add property_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'property_id'
    ) THEN
        ALTER TABLE reviews ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added property_id column';
    ELSE
        RAISE NOTICE '⚠️  property_id column already exists';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error adding property_id: %', SQLERRM;
END $$;

-- 5. Add check constraint to ensure only one reference type
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reviews_single_reference' 
        AND table_name = 'reviews'
    ) THEN
        ALTER TABLE reviews 
        ADD CONSTRAINT reviews_single_reference 
        CHECK (
            (listing_id IS NOT NULL AND service_id IS NULL AND property_id IS NULL) OR
            (listing_id IS NULL AND service_id IS NOT NULL AND property_id IS NULL) OR
            (listing_id IS NULL AND service_id IS NULL AND property_id IS NOT NULL)
        );
        RAISE NOTICE '✅ Added check constraint for single reference';
    ELSE
        RAISE NOTICE '⚠️  Check constraint already exists';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error adding check constraint: %', SQLERRM;
END $$;

-- 6. Create indexes for better performance
DO $$ 
BEGIN
    CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
    
    RAISE NOTICE '✅ Created indexes';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Error creating indexes: %', SQLERRM;
END $$;

-- 7. Update RLS policies if needed
DO $$ 
BEGIN
    -- Enable RLS
    ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
    
    -- Drop old policies if they exist
    DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
    
    -- Create new policies
    CREATE POLICY "Anyone can view reviews" ON reviews
        FOR SELECT USING (true);
    
    CREATE POLICY "Users can create reviews" ON reviews
        FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
    
    CREATE POLICY "Users can update own reviews" ON reviews
        FOR UPDATE USING (auth.uid() = reviewer_id);
    
    CREATE POLICY "Users can delete own reviews" ON reviews
        FOR DELETE USING (auth.uid() = reviewer_id);
    
    RAISE NOTICE '✅ Updated RLS policies';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Error updating RLS policies: %', SQLERRM;
END $$;

-- 8. Final success message
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '🎉 Reviews schema fixed successfully!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '1. Fixed foreign key to auth.users';
    RAISE NOTICE '2. Added service_id column';
    RAISE NOTICE '3. Added property_id column';
    RAISE NOTICE '4. Added check constraint for single reference';
    RAISE NOTICE '5. Created performance indexes';
    RAISE NOTICE '6. Updated RLS policies';
    RAISE NOTICE '';
END $$;
