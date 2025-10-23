-- =====================================================
-- SETUP ADMIN USER
-- Make friendlyrentals.mlr@gmail.com an admin
-- =====================================================

-- 1. Find the user ID for the admin email
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'friendlyrentals.mlr@gmail.com';

  IF admin_user_id IS NULL THEN
    RAISE NOTICE '❌ User not found! Please sign up first with friendlyrentals.mlr@gmail.com';
  ELSE
    RAISE NOTICE '✅ Found user: %', admin_user_id;
    
    -- Update or insert profile with admin privileges
    INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
    VALUES (
      admin_user_id,
      'friendlyrentals.mlr@gmail.com',
      'Admin User',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
      is_admin = true,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Admin privileges granted to friendlyrentals.mlr@gmail.com';
    RAISE NOTICE '✅ User can now access admin dashboard at /admin';
  END IF;
END $$;

-- 2. Verify the admin user
DO $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  SELECT is_admin INTO is_admin_user
  FROM profiles
  WHERE email = 'friendlyrentals.mlr@gmail.com';
  
  IF is_admin_user THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUCCESS! Admin user is set up correctly!';
    RAISE NOTICE '';
    RAISE NOTICE 'Admin Details:';
    RAISE NOTICE '  Email: friendlyrentals.mlr@gmail.com';
    RAISE NOTICE '  Admin Status: TRUE';
    RAISE NOTICE '  Can Access: /admin dashboard';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Sign in with friendlyrentals.mlr@gmail.com';
    RAISE NOTICE '  2. Go to https://neighbourfriendly.in/admin';
    RAISE NOTICE '  3. You should see the admin dashboard!';
  ELSE
    RAISE NOTICE '❌ Admin setup failed. User may not exist yet.';
    RAISE NOTICE 'Please sign up first at https://neighbourfriendly.in';
  END IF;
END $$;
