-- =====================================================
-- SETUP STORAGE BUCKETS FOR DOCUMENT UPLOADS
-- Creates necessary storage buckets with proper permissions
-- =====================================================

-- 1. Create id-documents bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-documents', 'id-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS policies for id-documents bucket
DROP POLICY IF EXISTS "Users can upload their own ID documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own ID documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all ID documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own ID documents" ON storage.objects;

-- Allow users to upload their own documents
CREATE POLICY "Users can upload their own ID documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'id-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own ID documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'id-documents' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
);

-- Allow admins to view all documents
CREATE POLICY "Admins can view all ID documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'id-documents' AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own ID documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'id-documents' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
);

-- 3. Add verification columns to profiles table (if not exists)
DO $$
BEGIN
  -- Add id_document_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_document_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_document_type TEXT;
  END IF;

  -- Add id_document_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_document_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_document_number TEXT;
  END IF;

  -- Add id_document_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_document_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_document_url TEXT;
  END IF;

  -- Add id_verification_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_verification_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_verification_status TEXT DEFAULT 'not_submitted' CHECK (id_verification_status IN ('not_submitted', 'pending', 'verified', 'rejected'));
  END IF;

  -- Add id_verified column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_verified BOOLEAN DEFAULT false;
  END IF;

  -- Add id_rejection_reason column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_rejection_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_rejection_reason TEXT;
  END IF;

  -- Add id_verified_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_verified_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_verified_at TIMESTAMPTZ;
  END IF;

  -- Add id_verified_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_verified_by'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_verified_by UUID REFERENCES profiles(id);
  END IF;
END $$;

-- 4. Success message
DO $$
BEGIN
  RAISE NOTICE '✅ ✅ ✅ STORAGE SETUP COMPLETE! ✅ ✅ ✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  ✓ id-documents storage bucket';
  RAISE NOTICE '  ✓ Upload permissions for users';
  RAISE NOTICE '  ✓ View permissions for users and admins';
  RAISE NOTICE '  ✓ Delete permissions for users and admins';
  RAISE NOTICE '  ✓ Verification columns in profiles table';
  RAISE NOTICE '';
  RAISE NOTICE 'Users can now:';
  RAISE NOTICE '  ✓ Upload ID documents';
  RAISE NOTICE '  ✓ View their own documents';
  RAISE NOTICE '  ✓ Delete their own documents';
  RAISE NOTICE '';
  RAISE NOTICE 'Admins can:';
  RAISE NOTICE '  ✓ View all documents';
  RAISE NOTICE '  ✓ Verify/reject documents';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Document verification is ready to use!';
END $$;
