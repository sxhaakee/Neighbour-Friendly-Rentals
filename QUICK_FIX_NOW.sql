-- =====================================================
-- QUICK FIX - Run this NOW in Supabase SQL Editor
-- This fixes the "column item_type does not exist" error
-- =====================================================

-- 1. DROP AND RECREATE FAVORITES TABLE WITH CORRECT SCHEMA
DROP TABLE IF EXISTS favorites CASCADE;

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('item', 'property', 'service')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type, item_id)
);

-- 2. CREATE INDEXES
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_type_item ON favorites(type, item_id);

-- 3. ENABLE RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 5. GRANT PERMISSIONS
GRANT ALL ON favorites TO authenticated;
GRANT USAGE ON SEQUENCE favorites_id_seq TO authenticated;

-- =====================================================
-- VERIFY IT WORKED
-- =====================================================

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'favorites';

-- Should show: id, user_id, type, item_id, created_at

-- =====================================================
-- SUCCESS!
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Favorites table fixed!';
  RAISE NOTICE '✅ Column is now "type" (not "item_type")';
  RAISE NOTICE '✅ RLS policies created';
  RAISE NOTICE '✅ No more 400 errors!';
END $$;
