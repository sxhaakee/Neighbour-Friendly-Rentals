-- =====================================================
-- PHASE 1: DATABASE MIGRATIONS
-- Reviews, Bookings, Notifications, Search Preferences
-- =====================================================

-- 1. CREATE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES listings(id) ON DELETE CASCADE,
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
    (item_id IS NOT NULL AND property_id IS NULL AND service_id IS NULL) OR
    (item_id IS NULL AND property_id IS NOT NULL AND service_id IS NULL) OR
    (item_id IS NULL AND property_id IS NULL AND service_id IS NOT NULL)
  )
);

-- 2. CREATE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES listings(id) ON DELETE CASCADE,
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
    (item_id IS NOT NULL AND property_id IS NULL AND service_id IS NULL) OR
    (item_id IS NULL AND property_id IS NOT NULL AND service_id IS NULL) OR
    (item_id IS NULL AND property_id IS NULL AND service_id IS NOT NULL)
  ),
  CONSTRAINT booking_dates_check CHECK (end_date >= start_date)
);

-- 3. CREATE NOTIFICATIONS TABLE
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

-- 4. CREATE SEARCH PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS search_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filters JSONB NOT NULL,
  search_query TEXT,
  saved_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, saved_name)
);

-- 5. CREATE RECENT SEARCHES TABLE
CREATE TABLE IF NOT EXISTS recent_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE REVIEW HELPFUL VOTES TABLE
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_reviews_item_id ON reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_item_id ON bookings(item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_preferences_user_id ON search_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_searches_user_id ON recent_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_searches_created_at ON recent_searches(created_at DESC);

-- 8. ENABLE RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- 9. CREATE RLS POLICIES FOR REVIEWS
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- 10. CREATE RLS POLICIES FOR BOOKINGS
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Users can cancel their bookings"
  ON bookings FOR DELETE
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- 11. CREATE RLS POLICIES FOR NOTIFICATIONS
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 12. CREATE RLS POLICIES FOR SEARCH PREFERENCES
CREATE POLICY "Users can manage their search preferences"
  ON search_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 13. CREATE RLS POLICIES FOR RECENT SEARCHES
CREATE POLICY "Users can manage their recent searches"
  ON recent_searches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 14. CREATE RLS POLICIES FOR REVIEW HELPFUL VOTES
CREATE POLICY "Anyone can view helpful votes"
  ON review_helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote on reviews"
  ON review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their votes"
  ON review_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- 15. CREATE FUNCTIONS FOR AUTOMATIC UPDATES
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_helpful_count_trigger
AFTER INSERT OR DELETE ON review_helpful_votes
FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- 16. CREATE FUNCTION TO UPDATE AVERAGE RATINGS
CREATE OR REPLACE FUNCTION update_item_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.item_id IS NOT NULL THEN
    UPDATE listings 
    SET rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE item_id = NEW.item_id)
    WHERE id = NEW.item_id;
  ELSIF NEW.property_id IS NOT NULL THEN
    UPDATE properties 
    SET rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE property_id = NEW.property_id)
    WHERE id = NEW.property_id;
  ELSIF NEW.service_id IS NOT NULL THEN
    UPDATE service_providers 
    SET rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE service_id = NEW.service_id)
    WHERE id = NEW.service_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_item_rating();

-- 17. CREATE FUNCTION TO PREVENT DOUBLE BOOKINGS
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE (
      (NEW.item_id IS NOT NULL AND item_id = NEW.item_id) OR
      (NEW.property_id IS NOT NULL AND property_id = NEW.property_id) OR
      (NEW.service_id IS NOT NULL AND service_id = NEW.service_id)
    )
    AND status IN ('pending', 'confirmed')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (NEW.start_date, NEW.end_date) OVERLAPS (start_date, end_date)
    )
  ) THEN
    RAISE EXCEPTION 'Booking conflict: Item is already booked for these dates';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_booking_conflict_trigger
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION check_booking_conflict();

-- 18. CREATE FUNCTION TO AUTO-CREATE NOTIFICATIONS
CREATE OR REPLACE FUNCTION create_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify owner of new booking
  INSERT INTO notifications (user_id, type, title, message, link, data)
  VALUES (
    NEW.owner_id,
    'booking',
    'New Booking Request',
    'You have a new booking request',
    '/dashboard',
    jsonb_build_object('booking_id', NEW.id, 'status', NEW.status)
  );
  
  -- Notify renter when status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO notifications (user_id, type, title, message, link, data)
    VALUES (
      NEW.renter_id,
      'booking',
      'Booking Status Updated',
      'Your booking status has been updated to: ' || NEW.status,
      '/dashboard',
      jsonb_build_object('booking_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_notification_trigger
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION create_booking_notification();

-- 19. GRANT PERMISSIONS
GRANT ALL ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT ALL ON bookings TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON search_preferences TO authenticated;
GRANT ALL ON recent_searches TO authenticated;
GRANT ALL ON review_helpful_votes TO authenticated;
GRANT SELECT ON review_helpful_votes TO anon;

-- 20. SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ PHASE 1 DATABASE MIGRATION COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ Reviews table created';
  RAISE NOTICE '✅ Bookings table created';
  RAISE NOTICE '✅ Notifications table created';
  RAISE NOTICE '✅ Search preferences table created';
  RAISE NOTICE '✅ Recent searches table created';
  RAISE NOTICE '✅ Review helpful votes table created';
  RAISE NOTICE '✅ All indexes created';
  RAISE NOTICE '✅ All RLS policies created';
  RAISE NOTICE '✅ All triggers created';
  RAISE NOTICE '✅ All permissions granted';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 Ready for Phase 1 features!';
  RAISE NOTICE '==============================================';
END $$;
