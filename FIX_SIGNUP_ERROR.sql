-- Fix Sign Up Error: "Database error saving new user"
-- This script ensures the profile creation trigger works correctly

-- 1. Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 2. Drop existing trigger if it exists (to recreate it)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    phone,
    address,
    is_admin,
    is_premium,
    premium_until,
    is_verified,
    verification_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    NULL,
    false,
    false,
    NULL,
    false,
    'pending',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- 7. Enable RLS (Row Level Security) on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 9. Verify the setup
SELECT 
  'Trigger exists' as status,
  tgname as trigger_name,
  tgtype as trigger_type
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 10. Test query to check if profiles table is accessible
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- SUCCESS MESSAGE
SELECT '✅ Database trigger fixed! Try signing up again.' as message;
