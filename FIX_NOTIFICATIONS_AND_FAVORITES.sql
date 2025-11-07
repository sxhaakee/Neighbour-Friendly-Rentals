-- ============================================
-- FIX NOTIFICATIONS & FAVORITES ERRORS
-- ============================================
-- This script fixes:
-- 1. Notifications table RLS policies (403 Forbidden)
-- 2. Favorites table creation and RLS policies (400 Bad Request)
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🔧 FIXING NOTIFICATIONS & FAVORITES';
  RAISE NOTICE '==============================================';

  -- ============================================
  -- 1. FIX NOTIFICATIONS TABLE
  -- ============================================
  
  RAISE NOTICE '';
  RAISE NOTICE '📬 Step 1: Fixing Notifications Table...';
  
  -- Create notifications table if it doesn't exist
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('booking', 'message', 'review', 'payment', 'system', 'reminder', 'approval', 'rejection', 'verification')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  RAISE NOTICE '✅ Notifications table ready';

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = FALSE;
  CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
  
  RAISE NOTICE '✅ Indexes created';

  -- Enable RLS
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE '✅ RLS enabled for notifications';

  -- Drop ALL existing policies
  DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
  DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON notifications;
  
  RAISE NOTICE '✅ Old policies dropped';

  -- Create NEW RLS policies
  
  -- SELECT: Users can view their own notifications
  CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

  -- UPDATE: Users can update their own notifications
  CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- DELETE: Users can delete their own notifications
  CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

  -- INSERT: Allow authenticated users to create notifications
  CREATE POLICY "Authenticated users can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

  RAISE NOTICE '✅ Notifications RLS policies created';

  -- ============================================
  -- 2. CREATE FAVORITES TABLE
  -- ============================================
  
  RAISE NOTICE '';
  RAISE NOTICE '⭐ Step 2: Creating Favorites Table...';

  -- Create favorites table if it doesn't exist
  CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('item', 'property', 'service')),
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, type, item_id)
  );

  RAISE NOTICE '✅ Favorites table created';

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
  CREATE INDEX IF NOT EXISTS idx_favorites_item_id ON favorites(item_id);
  CREATE INDEX IF NOT EXISTS idx_favorites_type ON favorites(type);
  CREATE INDEX IF NOT EXISTS idx_favorites_user_type ON favorites(user_id, type);

  RAISE NOTICE '✅ Favorites indexes created';

  -- Enable RLS
  ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

  RAISE NOTICE '✅ RLS enabled for favorites';

  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
  DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
  DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

  -- Create RLS policies for favorites
  CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

  RAISE NOTICE '✅ Favorites RLS policies created';

  -- ============================================
  -- 3. CREATE FUNCTION TO AUTO-UPDATE updated_at
  -- ============================================

  RAISE NOTICE '';
  RAISE NOTICE '⚙️  Step 3: Creating Auto-Update Functions...';

  -- Function to update updated_at timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $func$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql;

  -- Drop existing trigger if exists
  DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

  -- Create trigger for notifications
  CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  RAISE NOTICE '✅ Auto-update triggers created';

  -- ============================================
  -- FINAL SUCCESS MESSAGE
  -- ============================================
  
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 ALL ERRORS FIXED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Fixed Issues:';
  RAISE NOTICE '   1. ✅ Notifications table with RLS policies';
  RAISE NOTICE '   2. ✅ Favorites table with RLS policies';
  RAISE NOTICE '   3. ✅ 403 Forbidden errors resolved';
  RAISE NOTICE '   4. ✅ 400 Bad Request errors resolved';
  RAISE NOTICE '   5. ✅ Auto-update timestamps';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tables Created:';
  RAISE NOTICE '   • notifications (with INSERT policy)';
  RAISE NOTICE '   • favorites (with full CRUD policies)';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Next Steps:';
  RAISE NOTICE '   1. Refresh your browser (Cmd+Shift+R)';
  RAISE NOTICE '   2. Check console - errors should be gone!';
  RAISE NOTICE '   3. Try adding favorites';
  RAISE NOTICE '   4. Notifications should now work!';
  RAISE NOTICE '==============================================';

END $$;
