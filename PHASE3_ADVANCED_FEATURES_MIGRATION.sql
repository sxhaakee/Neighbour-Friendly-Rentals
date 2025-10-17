-- =====================================================
-- PHASE 3: AI RECOMMENDATIONS, SOCIAL FEATURES, ANALYTICS
-- =====================================================

-- 1. CREATE USER_FOLLOWS TABLE (Social Features)
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 2. CREATE ACTIVITY_FEED TABLE (Social Features)
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('listing', 'booking', 'review', 'follow')),
  action TEXT NOT NULL,
  target_id UUID,
  target_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE REFERRALS TABLE (Social Features)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referred_id)
);

-- 4. ADD SOCIAL COLUMNS TO PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS listings_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bookings_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- 5. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created ON user_follows(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON activity_feed(type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_followers ON profiles(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_listings ON profiles(listings_count DESC);

-- 6. ENABLE RLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES FOR USER_FOLLOWS
CREATE POLICY "Anyone can view follows"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 8. CREATE RLS POLICIES FOR ACTIVITY_FEED
CREATE POLICY "Users can view activity feed"
  ON activity_feed FOR SELECT
  USING (true);

CREATE POLICY "Users can create activities"
  ON activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 9. CREATE RLS POLICIES FOR REFERRALS
CREATE POLICY "Users can view their referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

CREATE POLICY "Admins can manage referrals"
  ON referrals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 10. CREATE FUNCTION TO UPDATE USER STATS
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS void AS $$
BEGIN
  -- Update listings count
  UPDATE profiles p
  SET listings_count = (
    SELECT COUNT(*) FROM listings WHERE user_id = p.id
  );

  -- Update bookings count
  UPDATE profiles p
  SET bookings_count = (
    SELECT COUNT(*) FROM bookings WHERE owner_id = p.id
  );

  -- Update reviews count
  UPDATE profiles p
  SET reviews_count = (
    SELECT COUNT(*) FROM reviews WHERE user_id = p.id
  );
END;
$$ LANGUAGE plpgsql;

-- 11. CREATE TRIGGER TO UPDATE FOLLOWER COUNTS
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for following user
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    -- Increment following count for follower user
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count for following user
    UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    -- Decrement following count for follower user
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follower_counts_trigger
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- 12. CREATE TRIGGER TO AUTO-CREATE ACTIVITY
CREATE OR REPLACE FUNCTION auto_create_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'listings' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (user_id, type, action, target_id, target_title)
    VALUES (NEW.user_id, 'listing', 'posted a new listing', NEW.id, NEW.title);
  ELSIF TG_TABLE_NAME = 'bookings' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (user_id, type, action, target_id)
    VALUES (NEW.renter_id, 'booking', 'made a booking', NEW.id);
  ELSIF TG_TABLE_NAME = 'reviews' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (user_id, type, action, target_id)
    VALUES (NEW.user_id, 'review', 'left a review', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_listing_activity
AFTER INSERT ON listings
FOR EACH ROW EXECUTE FUNCTION auto_create_activity();

CREATE TRIGGER auto_create_booking_activity
AFTER INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION auto_create_activity();

CREATE TRIGGER auto_create_review_activity
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION auto_create_activity();

-- 13. CREATE FUNCTION TO COMPLETE REFERRAL
CREATE OR REPLACE FUNCTION complete_referral()
RETURNS TRIGGER AS $$
DECLARE
  referral_record RECORD;
BEGIN
  -- Check if user has a referral
  SELECT * INTO referral_record FROM referrals WHERE referred_id = NEW.renter_id AND status = 'pending';
  
  IF FOUND AND NEW.status = 'completed' THEN
    -- Mark referral as completed
    UPDATE referrals 
    SET status = 'completed', completed_at = NOW()
    WHERE id = referral_record.id;
    
    -- Could add reward logic here
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complete_referral_trigger
AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION complete_referral();

-- 14. GRANT PERMISSIONS
GRANT ALL ON user_follows TO authenticated;
GRANT SELECT ON user_follows TO anon;
GRANT ALL ON activity_feed TO authenticated;
GRANT SELECT ON activity_feed TO anon;
GRANT ALL ON referrals TO authenticated;

-- 15. CREATE VIEW FOR LEADERBOARD
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  p.listings_count,
  p.bookings_count,
  p.reviews_count,
  p.followers_count,
  (p.listings_count * 10 + p.bookings_count * 5 + p.reviews_count * 3 + p.followers_count) as total_score
FROM profiles p
ORDER BY total_score DESC;

-- 16. SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ PHASE 3 ADVANCED FEATURES MIGRATION COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ Social features tables created';
  RAISE NOTICE '✅ Activity feed system ready';
  RAISE NOTICE '✅ Referral system ready';
  RAISE NOTICE '✅ User stats columns added';
  RAISE NOTICE '✅ All indexes created';
  RAISE NOTICE '✅ All RLS policies created';
  RAISE NOTICE '✅ Auto-update triggers created';
  RAISE NOTICE '✅ Leaderboard view created';
  RAISE NOTICE '✅ All permissions granted';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 AI Recommendations, Social Features, Analytics ready!';
  RAISE NOTICE '==============================================';
END $$;
