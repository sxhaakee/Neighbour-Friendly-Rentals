-- ============================================
-- FIX ALL CONSOLE ERRORS
-- ============================================
-- This script fixes:
-- 1. 403 Forbidden on notifications endpoint
-- 2. 400 Bad Request on storage bucket
-- 3. RLS policy errors for notifications
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🔧 FIXING CONSOLE ERRORS';
  RAISE NOTICE '==============================================';

  -- ============================================
  -- 1. FIX NOTIFICATIONS TABLE & RLS POLICIES
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
  
  RAISE NOTICE '✅ RLS enabled';

  -- Drop ALL existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
  DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON notifications;
  
  RAISE NOTICE '✅ Old policies dropped';

  -- Create NEW RLS policies with proper permissions
  
  -- SELECT: Users can view their own notifications
  CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

  -- UPDATE: Users can update their own notifications (mark as read)
  CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- DELETE: Users can delete their own notifications
  CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

  -- INSERT: Allow authenticated users to create notifications
  -- This is crucial - without it, you get 403 Forbidden
  CREATE POLICY "Authenticated users can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

  RAISE NOTICE '✅ New RLS policies created';

  -- ============================================
  -- 2. FIX STORAGE BUCKETS
  -- ============================================
  
  RAISE NOTICE '';
  RAISE NOTICE '🗄️  Step 2: Fixing Storage Buckets...';

  -- Create storage buckets if they don't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES 
    ('services', 'services', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
    ('listing-images', 'listing-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
    ('property-images', 'property-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
    ('verification-documents', 'verification-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

  RAISE NOTICE '✅ Storage buckets created/updated';

  -- ============================================
  -- 3. CREATE STORAGE POLICIES FOR 'services' BUCKET
  -- ============================================
  
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Step 3: Creating Storage Policies...';

  -- Drop existing policies
  DROP POLICY IF EXISTS "Public Read Access - services" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Upload - services" ON storage.objects;
  DROP POLICY IF EXISTS "Owner Delete - services" ON storage.objects;
  DROP POLICY IF EXISTS "Owner Update - services" ON storage.objects;

  -- Create policies for 'services' bucket
  CREATE POLICY "Public Read Access - services"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'services');

  CREATE POLICY "Authenticated Upload - services"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'services' 
      AND auth.role() = 'authenticated'
    );

  CREATE POLICY "Owner Delete - services"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'services' 
      AND auth.uid() = owner
    );

  CREATE POLICY "Owner Update - services"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'services' 
      AND auth.uid() = owner
    );

  RAISE NOTICE '✅ Storage policies created for services bucket';

  -- ============================================
  -- 4. CREATE STORAGE POLICIES FOR 'listing-images' BUCKET
  -- ============================================

  -- Drop existing policies
  DROP POLICY IF EXISTS "Public Read Access - listing-images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Upload - listing-images" ON storage.objects;
  DROP POLICY IF EXISTS "Owner Delete - listing-images" ON storage.objects;
  DROP POLICY IF EXISTS "Owner Update - listing-images" ON storage.objects;

  -- Create policies for 'listing-images' bucket
  CREATE POLICY "Public Read Access - listing-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'listing-images');

  CREATE POLICY "Authenticated Upload - listing-images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'listing-images' 
      AND auth.role() = 'authenticated'
    );

  CREATE POLICY "Owner Delete - listing-images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'listing-images' 
      AND auth.uid() = owner
    );

  CREATE POLICY "Owner Update - listing-images"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'listing-images' 
      AND auth.uid() = owner
    );

  RAISE NOTICE '✅ Storage policies created for listing-images bucket';

  -- ============================================
  -- 5. CREATE STORAGE POLICIES FOR 'property-images' BUCKET
  -- ============================================

  -- Drop existing policies
  DROP POLICY IF EXISTS "Public Read Access - property-images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Upload - property-images" ON storage.objects;
  DROP POLICY IF EXISTS "Owner Delete - property-images" ON storage.objects;
  DROP POLICY IF EXISTS "Owner Update - property-images" ON storage.objects;

  -- Create policies for 'property-images' bucket
  CREATE POLICY "Public Read Access - property-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'property-images');

  CREATE POLICY "Authenticated Upload - property-images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'property-images' 
      AND auth.role() = 'authenticated'
    );

  CREATE POLICY "Owner Delete - property-images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'property-images' 
      AND auth.uid() = owner
    );

  CREATE POLICY "Owner Update - property-images"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'property-images' 
      AND auth.uid() = owner
    );

  RAISE NOTICE '✅ Storage policies created for property-images bucket';

  -- ============================================
  -- 6. CREATE STORAGE POLICIES FOR 'verification-documents' BUCKET (PRIVATE)
  -- ============================================

  -- Drop existing policies
  DROP POLICY IF EXISTS "Owner Read Access - verification-documents" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Upload - verification-documents" ON storage.objects;
  DROP POLICY IF EXISTS "Owner Delete - verification-documents" ON storage.objects;
  DROP POLICY IF EXISTS "Admin Read Access - verification-documents" ON storage.objects;

  -- Create policies for 'verification-documents' bucket (private)
  CREATE POLICY "Owner Read Access - verification-documents"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'verification-documents' 
      AND auth.uid() = owner
    );

  CREATE POLICY "Authenticated Upload - verification-documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'verification-documents' 
      AND auth.role() = 'authenticated'
    );

  CREATE POLICY "Owner Delete - verification-documents"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'verification-documents' 
      AND auth.uid() = owner
    );

  -- Allow admins to read verification documents
  CREATE POLICY "Admin Read Access - verification-documents"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'verification-documents' 
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
      )
    );

  RAISE NOTICE '✅ Storage policies created for verification-documents bucket';

  -- ============================================
  -- FINAL SUCCESS MESSAGE
  -- ============================================
  
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 ALL CONSOLE ERRORS FIXED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Fixed Issues:';
  RAISE NOTICE '   1. Notifications table RLS policies';
  RAISE NOTICE '   2. Storage buckets created';
  RAISE NOTICE '   3. Storage policies for all buckets';
  RAISE NOTICE '   4. 403 Forbidden errors resolved';
  RAISE NOTICE '   5. 400 Bad Request errors resolved';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Next Steps:';
  RAISE NOTICE '   1. Refresh your browser';
  RAISE NOTICE '   2. Clear browser cache (Cmd+Shift+R)';
  RAISE NOTICE '   3. Try uploading images again';
  RAISE NOTICE '   4. Check console - errors should be gone!';
  RAISE NOTICE '==============================================';

END $$;
