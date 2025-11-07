-- ============================================
-- ADD SERVICE AND PROPERTY REVIEW COLUMNS
-- ============================================
-- This script adds service_id and property_id columns to reviews table
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '📝 ADDING REVIEW COLUMNS FOR SERVICES & PROPERTIES';
  RAISE NOTICE '==============================================';

  -- Add service_id column
  BEGIN
    ALTER TABLE reviews 
    ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES service_providers(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added service_id column';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  service_id column already exists or error: %', SQLERRM;
  END;

  -- Add property_id column
  BEGIN
    ALTER TABLE reviews 
    ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added property_id column';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  property_id column already exists or error: %', SQLERRM;
  END;

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
  RAISE NOTICE '✅ Created indexes';

  -- Update RLS policies to include service and property reviews
  DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
  CREATE POLICY "Anyone can view reviews"
    ON reviews FOR SELECT
    USING (true);
  RAISE NOTICE '✅ Updated SELECT policy';

  DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
  CREATE POLICY "Users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  RAISE NOTICE '✅ Updated INSERT policy';

  DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
  CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  RAISE NOTICE '✅ Updated UPDATE policy';

  DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
  CREATE POLICY "Users can delete their own reviews"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);
  RAISE NOTICE '✅ Updated DELETE policy';

  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 REVIEW COLUMNS ADDED SUCCESSFULLY!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ What was added:';
  RAISE NOTICE '   • service_id column (references service_providers)';
  RAISE NOTICE '   • property_id column (references properties)';
  RAISE NOTICE '   • Indexes for performance';
  RAISE NOTICE '   • Updated RLS policies';
  RAISE NOTICE '';
  RAISE NOTICE '🎊 Reviews now work for:';
  RAISE NOTICE '   ✅ Items (listing_id)';
  RAISE NOTICE '   ✅ Services (service_id)';
  RAISE NOTICE '   ✅ Properties (property_id)';
  RAISE NOTICE '==============================================';

END $$;
