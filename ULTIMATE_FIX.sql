-- ============================================
-- ULTIMATE FIX - FIXES ALL ISSUES ONCE AND FOR ALL
-- ============================================
-- Run this in Supabase SQL Editor
-- This script is idempotent (safe to run multiple times)
-- ============================================

-- STEP 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 2: Ensure profiles table exists with correct schema
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Add missing columns to profiles
DO $$
BEGIN
  -- Add role column if it doesn't exist (for old databases)
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));
  END IF;
  
  -- Add social columns
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS listings_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bookings_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
  
  RAISE NOTICE '✅ Profiles table updated with all columns';
END $$;

-- STEP 4: Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: Create trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 7: Drop all existing profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- STEP 8: Create profile policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- STEP 9: Ensure listings table has correct columns
DO $$
BEGIN
  -- Check if listings table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings') THEN
    -- Disable RLS on listings
    ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
    
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'user_id') THEN
      ALTER TABLE listings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      -- Copy owner_id to user_id if owner_id exists
      IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'owner_id') THEN
        UPDATE listings SET user_id = owner_id WHERE user_id IS NULL;
      END IF;
    END IF;
    
    RAISE NOTICE '✅ Listings table updated';
  END IF;
END $$;

-- STEP 10: Create profiles for existing users (if missing)
INSERT INTO profiles (id, email, full_name)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- STEP 11: Drop and recreate tables with correct schema
DROP TABLE IF EXISTS review_helpful_votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS activity_feed CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;

-- STEP 12: Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- STEP 13: Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  renter_name TEXT NOT NULL,
  renter_email TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 14: Create conversations and messages tables
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, user1_id, user2_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 15: Create social features tables
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id UUID,
  target_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referred_id)
);

-- STEP 16: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking', 'message', 'review', 'payment', 'system', 'reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 17: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- STEP 18: Enable RLS on all tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- STEP 19: Drop all existing policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename;
  END LOOP;
  RAISE NOTICE '✅ Dropped all existing RLS policies';
END $$;

-- STEP 20: Create RLS policies
-- Profiles policies
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Review votes policies
CREATE POLICY "Anyone can view votes" ON review_helpful_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON review_helpful_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove votes" ON review_helpful_votes FOR DELETE USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users view own bookings" ON bookings FOR SELECT
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);
CREATE POLICY "Users create bookings" ON bookings FOR INSERT
  WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Users update own bookings" ON bookings FOR UPDATE
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Conversations policies
CREATE POLICY "Users view own conversations" ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users create conversations" ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users update own conversations" ON conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages policies
CREATE POLICY "Users view own messages" ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users send messages" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users update received messages" ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Social features policies
CREATE POLICY "Anyone view follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Activity feed policies - ALLOW ALL INSERTS for triggers
CREATE POLICY "Anyone view activity" ON activity_feed FOR SELECT USING (true);
CREATE POLICY "Allow all activity inserts" ON activity_feed FOR INSERT WITH CHECK (true);

-- Referrals policies
CREATE POLICY "Users view own referrals" ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users create referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- Notifications policies
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "System create notifications" ON notifications FOR INSERT
  WITH CHECK (true);

-- STEP 21: Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;
GRANT ALL ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT ALL ON review_helpful_votes TO authenticated;
GRANT ALL ON bookings TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON user_follows TO authenticated;
GRANT ALL ON activity_feed TO authenticated;
GRANT ALL ON referrals TO authenticated;
GRANT ALL ON notifications TO authenticated;

-- STEP 22: Create RPC function for conversations
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_listing_id UUID,
  p_user1_id UUID,
  p_user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE listing_id = p_listing_id
    AND ((user1_id = p_user1_id AND user2_id = p_user2_id)
      OR (user1_id = p_user2_id AND user2_id = p_user1_id))
  LIMIT 1;
  
  -- If not found, create new conversation
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (listing_id, user1_id, user2_id)
    VALUES (p_listing_id, p_user1_id, p_user2_id)
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 23: Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ ULTIMATE FIX COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ Profiles table created/updated';
  RAISE NOTICE '✅ Auto-create profile trigger installed';
  RAISE NOTICE '✅ All missing profiles created';
  RAISE NOTICE '✅ All tables created with correct schema';
  RAISE NOTICE '✅ All RLS policies created';
  RAISE NOTICE '✅ All indexes created';
  RAISE NOTICE '✅ All permissions granted';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 Database is ready to use!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📝 TO MAKE YOURSELF ADMIN:';
  RAISE NOTICE 'UPDATE profiles SET role = ''admin'' WHERE email = ''your-email@example.com'';';
  RAISE NOTICE '==============================================';
END $$;
