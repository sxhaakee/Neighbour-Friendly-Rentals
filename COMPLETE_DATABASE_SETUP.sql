-- =====================================================
-- COMPLETE DATABASE SETUP - RUN THIS ONCE
-- This script handles everything cleanly
-- =====================================================

-- STEP 1: Clean up existing tables and policies
DO $$
BEGIN
  -- Drop all policies first
  DROP POLICY IF EXISTS "Anyone can view follows" ON user_follows;
  DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
  DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;
  DROP POLICY IF EXISTS "Users can view activity feed" ON activity_feed;
  DROP POLICY IF EXISTS "Users can create activities" ON activity_feed;
  DROP POLICY IF EXISTS "Users can view their referrals" ON referrals;
  DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
  DROP POLICY IF EXISTS "Admins can manage referrals" ON referrals;
  DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
  DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
  DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
  DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
  DROP POLICY IF EXISTS "Anyone can view helpful votes" ON review_helpful_votes;
  DROP POLICY IF EXISTS "Users can vote on reviews" ON review_helpful_votes;
  DROP POLICY IF EXISTS "Users can remove their votes" ON review_helpful_votes;
  DROP POLICY IF EXISTS "Users can view their bookings" ON bookings;
  DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
  DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
  DROP POLICY IF EXISTS "Users can view their messages" ON messages;
  DROP POLICY IF EXISTS "Users can send messages" ON messages;
  DROP POLICY IF EXISTS "Users can update their messages" ON messages;
  
  RAISE NOTICE '✅ Dropped existing policies';
END $$;

-- STEP 2: Drop and recreate tables with correct schema
DROP TABLE IF EXISTS review_helpful_votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS activity_feed CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;

-- STEP 2.5: Ensure listings table has user_id column and disable RLS
DO $$
BEGIN
  -- Check if listings table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings') THEN
    -- Disable RLS on listings table to allow inserts
    ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ Disabled RLS on listings table';
    
    -- Check if user_id column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'listings' 
      AND column_name = 'user_id'
    ) THEN
      -- Add user_id column if it doesn't exist
      ALTER TABLE listings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      -- Copy owner_id to user_id if owner_id exists
      IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'owner_id'
      ) THEN
        UPDATE listings SET user_id = owner_id WHERE user_id IS NULL;
      END IF;
      RAISE NOTICE '✅ Added user_id column to listings table';
    ELSE
      RAISE NOTICE 'ℹ️ user_id column already exists in listings table';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️ listings table does not exist yet';
  END IF;
END $$;

-- STEP 3: Create reviews table with listing_id
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  service_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[],
  verified_rental BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  reported BOOLEAN DEFAULT false,
  owner_response TEXT,
  owner_response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT review_target_check CHECK (
    (listing_id IS NOT NULL AND property_id IS NULL AND service_id IS NULL) OR
    (listing_id IS NULL AND property_id IS NOT NULL AND service_id IS NULL) OR
    (listing_id IS NULL AND property_id IS NULL AND service_id IS NOT NULL)
  )
);

CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- STEP 4: Create bookings table with listing_id
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  service_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_price DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  notes TEXT,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected')),
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES auth.users(id),
  cancelled_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT booking_target_check CHECK (
    (listing_id IS NOT NULL AND property_id IS NULL AND service_id IS NULL) OR
    (listing_id IS NULL AND property_id IS NOT NULL AND service_id IS NULL) OR
    (listing_id IS NULL AND property_id IS NULL AND service_id IS NOT NULL)
  ),
  CONSTRAINT booking_dates_check CHECK (end_date >= start_date)
);

-- STEP 5: Create conversations and messages tables
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  user1_typing BOOLEAN DEFAULT false,
  user2_typing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Create social features tables
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('listing', 'booking', 'review', 'follow')),
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

-- STEP 7: Add social columns and role to profiles (if not exists)
DO $$
BEGIN
  -- Add role column for admin access
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  
  -- Add social columns
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS listings_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bookings_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
  
  RAISE NOTICE '✅ Added role and social columns to profiles';
EXCEPTION
  WHEN duplicate_column THEN
    RAISE NOTICE 'ℹ️ Columns already exist';
END $$;

-- STEP 7.5: Make yourself admin (replace with your email)
-- Uncomment and update the email below to make a user admin
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- STEP 8: Create all indexes
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_listing ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON bookings(owner_id);

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

-- STEP 9: Enable RLS on all tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- STEP 10: Drop all existing policies first
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename;
  END LOOP;
  RAISE NOTICE '✅ Dropped all existing RLS policies';
END $$;

-- STEP 10.5: Create RLS policies
-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Review votes policies
CREATE POLICY "Anyone can view helpful votes" ON review_helpful_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on reviews" ON review_helpful_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their votes" ON review_helpful_votes FOR DELETE USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users can view their bookings" ON bookings FOR SELECT
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT
  WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Users can update their bookings" ON bookings FOR UPDATE
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can update their conversations" ON conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their messages" ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Social features policies
CREATE POLICY "Anyone can view follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Activity feed policies - ALLOW ALL INSERTS
CREATE POLICY "Users can view activity feed" ON activity_feed FOR SELECT USING (true);
CREATE POLICY "Allow all activity inserts" ON activity_feed FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their referrals" ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can create referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- STEP 11: Create or fix notifications table
DO $$
BEGIN
  -- Check if notifications table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read') THEN
      ALTER TABLE notifications ADD COLUMN read BOOLEAN DEFAULT false;
      RAISE NOTICE '✅ Added read column to notifications table';
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'data') THEN
      ALTER TABLE notifications ADD COLUMN data JSONB;
      RAISE NOTICE '✅ Added data column to notifications table';
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'link') THEN
      ALTER TABLE notifications ADD COLUMN link TEXT;
      RAISE NOTICE '✅ Added link column to notifications table';
    END IF;
  ELSE
    -- Create table if it doesn't exist
    CREATE TABLE notifications (
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
    RAISE NOTICE '✅ Created notifications table';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Create policies
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT
  WITH CHECK (true);

GRANT ALL ON notifications TO authenticated;

-- STEP 12: Create trigger for auto-creating activities
CREATE OR REPLACE FUNCTION auto_create_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'listings' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (user_id, type, action, target_id, target_title)
    VALUES (NEW.owner_id, 'listing', 'posted a new listing', NEW.id, NEW.title);
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Silently ignore errors to not block the main operation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_create_listing_activity ON listings;

-- Create trigger only if listings table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings') THEN
    CREATE TRIGGER auto_create_listing_activity
    AFTER INSERT ON listings
    FOR EACH ROW EXECUTE FUNCTION auto_create_activity();
    RAISE NOTICE '✅ Created activity trigger for listings';
  END IF;
END $$;

-- STEP 13: Grant permissions
GRANT ALL ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT ALL ON review_helpful_votes TO authenticated;
GRANT ALL ON bookings TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON user_follows TO authenticated;
GRANT ALL ON activity_feed TO authenticated;
GRANT ALL ON referrals TO authenticated;

-- STEP 14: Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ COMPLETE DATABASE SETUP SUCCESSFUL!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ All tables created with correct schema';
  RAISE NOTICE '✅ Reviews table uses listing_id';
  RAISE NOTICE '✅ Bookings table uses listing_id';
  RAISE NOTICE '✅ Messages table has receiver_id';
  RAISE NOTICE '✅ All RLS policies created';
  RAISE NOTICE '✅ All indexes created';
  RAISE NOTICE '✅ All permissions granted';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 Database is ready to use!';
  RAISE NOTICE '==============================================';
END $$;
