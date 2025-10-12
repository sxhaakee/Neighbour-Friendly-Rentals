-- ============================================
-- NFRR PRODUCTION SCHEMA v2.0
-- New Features: ID Verification, Commissions, Security Deposits, Favorites, etc.
-- Run this AFTER the base schema (supabase-schema.sql)
-- ============================================

-- ============================================
-- 1. ID VERIFICATION SYSTEM
-- ============================================

-- Add ID verification fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_document_type TEXT CHECK (id_document_type IN ('aadhar', 'pan', 'passport', 'driving_license')),
ADD COLUMN IF NOT EXISTS id_document_number TEXT,
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS id_verification_status TEXT DEFAULT 'pending' CHECK (id_verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS id_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS id_rejection_reason TEXT;

-- ============================================
-- 2. ENHANCED BOOKINGS WITH CHARGES
-- ============================================

-- Add commission, service charges, and delivery to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS item_price INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_commission DECIMAL(10,2) DEFAULT 0, -- 10% of item price
ADD COLUMN IF NOT EXISTS service_charge DECIMAL(10,2) DEFAULT 0, -- 2% + ₹40
ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10,2) DEFAULT 0, -- ₹40 if opted
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0, -- 18% GST on charges
ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_deposit_status TEXT DEFAULT 'pending' CHECK (security_deposit_status IN ('pending', 'held', 'returned', 'forfeited')),
ADD COLUMN IF NOT EXISTS delivery_opted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pickup_opted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS video_dispute_url TEXT,
ADD COLUMN IF NOT EXISTS renter_video_url TEXT,
ADD COLUMN IF NOT EXISTS owner_video_url TEXT,
ADD COLUMN IF NOT EXISTS agreement_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'online')),
ADD COLUMN IF NOT EXISTS admin_payment_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_verified_by UUID REFERENCES auth.users(id);

-- ============================================
-- 3. FAVORITES SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listing_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. BOOKING CONFLICTS & AVAILABILITY
-- ============================================

-- Function to check booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_listing_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM bookings
  WHERE listing_id = p_listing_id
    AND status IN ('confirmed', 'pending')
    AND (p_booking_id IS NULL OR id != p_booking_id)
    AND (
      (start_date <= p_end_date AND end_date >= p_start_date)
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent booking conflicts
CREATE OR REPLACE FUNCTION prevent_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF check_booking_conflict(NEW.listing_id, NEW.start_date, NEW.end_date, NEW.id) THEN
    RAISE EXCEPTION 'This item is already booked for the selected dates';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_booking_conflict_trigger ON bookings;
CREATE TRIGGER check_booking_conflict_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_booking_conflict();

-- ============================================
-- 5. NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('booking', 'payment', 'review', 'message', 'system')),
  related_id UUID, -- booking_id, listing_id, etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. ANALYTICS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

-- ============================================
-- 7. PREMIUM FEATURES
-- ============================================

CREATE TABLE IF NOT EXISTS premium_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('featured', 'promoted', 'premium')),
  price_paid DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_premium_listings_active ON premium_listings(is_active, end_date);

ALTER TABLE premium_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active premium listings"
  ON premium_listings FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Users can create premium listings"
  ON premium_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro', 'enterprise')),
  price_paid DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 9. STORAGE BUCKETS
-- ============================================

-- ID Documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-documents', 'id-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Agreement PDFs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('agreements', 'agreements', false)
ON CONFLICT (id) DO NOTHING;

-- Dispute videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('dispute-videos', 'dispute-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ID documents (private)
CREATE POLICY "Users can upload their own ID documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'id-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own ID documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'id-documents' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  );

-- Storage policies for agreements (private)
CREATE POLICY "Users can view their own agreements"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'agreements' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  );

-- Storage policies for dispute videos (private)
CREATE POLICY "Users can upload dispute videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'dispute-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own dispute videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'dispute-videos' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  );

-- ============================================
-- 10. ENHANCED VIEWS FOR ADMIN DASHBOARD
-- ============================================

-- Revenue analytics view
CREATE OR REPLACE VIEW revenue_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_bookings,
  SUM(total_price) as gross_revenue,
  SUM(platform_commission) as platform_commission,
  SUM(service_charge) as service_charges,
  SUM(delivery_charge) as delivery_charges,
  SUM(gst_amount) as gst_collected,
  SUM(platform_commission + service_charge + delivery_charge + gst_amount) as net_revenue
FROM bookings
WHERE payment_status = 'paid'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- User verification stats
CREATE OR REPLACE VIEW verification_stats AS
SELECT
  COUNT(*) FILTER (WHERE id_verification_status = 'pending') as pending_verifications,
  COUNT(*) FILTER (WHERE id_verification_status = 'verified') as verified_users,
  COUNT(*) FILTER (WHERE id_verification_status = 'rejected') as rejected_verifications,
  COUNT(*) FILTER (WHERE id_verified = TRUE) as total_verified
FROM profiles;

-- Booking analytics view
CREATE OR REPLACE VIEW booking_analytics AS
SELECT
  COUNT(*) as total_bookings,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
  COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_bookings,
  COUNT(*) FILTER (WHERE admin_payment_verified = TRUE) as admin_verified_bookings,
  AVG(total_price) as avg_booking_value,
  SUM(security_deposit) FILTER (WHERE security_deposit_status = 'held') as total_deposits_held
FROM bookings;

-- Grant access to views
GRANT SELECT ON revenue_analytics TO authenticated;
GRANT SELECT ON verification_stats TO authenticated;
GRANT SELECT ON booking_analytics TO authenticated;

-- ============================================
-- 11. HELPER FUNCTIONS
-- ============================================

-- Function to calculate booking charges
CREATE OR REPLACE FUNCTION calculate_booking_charges(
  p_item_price INTEGER,
  p_total_days INTEGER,
  p_delivery_opted BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  item_total DECIMAL(10,2),
  service_charge DECIMAL(10,2),
  delivery_charge DECIMAL(10,2),
  security_deposit DECIMAL(10,2),
  grand_total DECIMAL(10,2)
) AS $$
DECLARE
  v_item_total DECIMAL(10,2);
  v_service DECIMAL(10,2);
  v_delivery DECIMAL(10,2);
  v_deposit DECIMAL(10,2);
  v_total DECIMAL(10,2);
BEGIN
  -- Item total
  v_item_total := p_item_price * p_total_days;
  
  -- Service charge (10% - for safe renting and trust)
  v_service := v_item_total * 0.10;
  
  -- Delivery & Pickup charge (₹40 for both together)
  v_delivery := CASE WHEN p_delivery_opted THEN 40 ELSE 0 END;
  
  -- Security deposit (20%)
  v_deposit := v_item_total * 0.20;
  
  -- Grand total (no GST)
  v_total := v_item_total + v_service + v_delivery + v_deposit;
  
  RETURN QUERY SELECT 
    v_item_total,
    v_service,
    v_delivery,
    v_deposit,
    v_total;
END;
$$ LANGUAGE plpgsql;

-- Function to send notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, related_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_related_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. TRIGGERS FOR NOTIFICATIONS
-- ============================================

-- Notify owner on new booking
CREATE OR REPLACE FUNCTION notify_owner_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.owner_id,
    'New Booking Request',
    'You have a new booking request for your item',
    'booking',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_booking ON bookings;
CREATE TRIGGER on_new_booking
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_booking();

-- Notify renter on booking confirmation
CREATE OR REPLACE FUNCTION notify_renter_on_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    PERFORM create_notification(
      NEW.renter_id,
      'Booking Confirmed',
      'Your booking has been confirmed!',
      'booking',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_booking_confirmed ON bookings;
CREATE TRIGGER on_booking_confirmed
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_renter_on_confirmation();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON favorites TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON analytics_events TO authenticated;
GRANT ALL ON premium_listings TO authenticated;
GRANT ALL ON subscriptions TO authenticated;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status_payment ON bookings(status, payment_status);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(id_verified, id_verification_status);
CREATE INDEX IF NOT EXISTS idx_listings_availability ON listings(availability);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE favorites IS 'User favorite listings';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE analytics_events IS 'Track user behavior and events';
COMMENT ON TABLE premium_listings IS 'Premium/featured listing subscriptions';
COMMENT ON TABLE subscriptions IS 'User subscription plans';
COMMENT ON FUNCTION calculate_booking_charges IS 'Calculate all booking charges including commission, service charge, delivery, and GST';
COMMENT ON FUNCTION check_booking_conflict IS 'Check if a booking conflicts with existing bookings';

-- ============================================
-- COMPLETED!
-- ============================================
-- Run this schema after the base schema
-- Then update your database types: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
