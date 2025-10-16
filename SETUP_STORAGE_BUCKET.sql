-- =====================================================
-- SUPABASE STORAGE BUCKET SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- This SQL creates the storage bucket and sets up policies
-- However, storage buckets are usually created via the Supabase Dashboard UI

-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "Create a new bucket"
-- 3. Bucket name: listings
-- 4. Public bucket: YES (check the box)
-- 5. Click "Create bucket"

-- After creating the bucket, run this SQL to set up policies:

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listings');

-- Allow public access to read files
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listings');

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- ALTERNATIVE: If you prefer to create via SQL
-- (May not work in all Supabase versions)
-- =====================================================

-- Insert bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFY SETUP
-- =====================================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'listings';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
