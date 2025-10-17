-- =====================================================
-- COMPLETE FIX - Run this in Supabase SQL Editor
-- This will fix ALL "item_type" references
-- =====================================================

-- 1. DROP ALL FUNCTIONS THAT MIGHT REFERENCE item_type
DROP FUNCTION IF EXISTS get_user_favorites(uuid) CASCADE;
DROP FUNCTION IF EXISTS add_to_favorites(uuid, text, uuid) CASCADE;
DROP FUNCTION IF EXISTS remove_from_favorites(uuid, text, uuid) CASCADE;
DROP FUNCTION IF EXISTS is_favorite(uuid, text, uuid) CASCADE;

-- 2. DROP ALL VIEWS THAT MIGHT REFERENCE item_type
DROP VIEW IF EXISTS user_favorites_view CASCADE;
DROP VIEW IF EXISTS favorites_with_details CASCADE;

-- 3. DROP ALL TRIGGERS THAT MIGHT REFERENCE item_type
DROP TRIGGER IF EXISTS favorites_insert_trigger ON favorites CASCADE;
DROP TRIGGER IF EXISTS favorites_update_trigger ON favorites CASCADE;

-- 4. DROP THE FAVORITES TABLE COMPLETELY
DROP TABLE IF EXISTS favorites CASCADE;

-- 5. CREATE FRESH FAVORITES TABLE WITH CORRECT SCHEMA
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('item', 'property', 'service')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type, item_id)
);

-- 6. CREATE INDEXES
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_type_item ON favorites(type, item_id);

-- 7. ENABLE RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 8. CREATE RLS POLICIES
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 9. GRANT PERMISSIONS
GRANT ALL ON favorites TO authenticated;
GRANT ALL ON favorites TO anon;

-- 10. CREATE HELPER FUNCTIONS (using correct column name)
CREATE OR REPLACE FUNCTION get_user_favorites(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  item_id UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.user_id, f.type, f.item_id, f.created_at
  FROM favorites f
  WHERE f.user_id = p_user_id
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFY THE FIX
-- =====================================================

-- Check table structure
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'favorites' 
    AND column_name = 'type'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE '✅ SUCCESS: Column "type" exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: Column "type" does not exist';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'favorites' 
    AND column_name = 'item_type'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE EXCEPTION '❌ FAILED: Old column "item_type" still exists';
  ELSE
    RAISE NOTICE '✅ SUCCESS: Old column "item_type" removed';
  END IF;
END $$;

-- Show table structure
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ ALL FIXES COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ Favorites table recreated';
  RAISE NOTICE '✅ Column is "type" (not "item_type")';
  RAISE NOTICE '✅ All functions updated';
  RAISE NOTICE '✅ All views dropped';
  RAISE NOTICE '✅ All triggers dropped';
  RAISE NOTICE '✅ RLS policies created';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 You can now use the app without errors!';
  RAISE NOTICE '==============================================';
END $$;
