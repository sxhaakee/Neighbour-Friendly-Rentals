-- =====================================================
-- PHASE 2: MESSAGING, PAYMENTS, VERIFICATION
-- =====================================================

-- 1. CREATE CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
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

-- 2. CREATE MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  refund_id TEXT,
  refund_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_verified BOOLEAN DEFAULT false,
  phone_number TEXT,
  phone_verified_at TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  id_verified BOOLEAN DEFAULT false,
  id_type TEXT CHECK (id_type IN ('aadhaar', 'pan', 'passport', 'driving_license')),
  id_number TEXT,
  id_document_url TEXT,
  id_verified_at TIMESTAMPTZ,
  address_verified BOOLEAN DEFAULT false,
  address_proof_url TEXT,
  address_verified_at TIMESTAMPTZ,
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE BLOCKED_USERS TABLE
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- 6. CREATE USER_REPORTS TABLE
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 7. CREATE OTP_VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_verifications_user ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_trust_score ON verifications(trust_score DESC);

CREATE INDEX IF NOT EXISTS idx_blocked_users_user ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_user_id);

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);

CREATE INDEX IF NOT EXISTS idx_otp_user ON otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- 9. ENABLE RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- 10. CREATE RLS POLICIES FOR CONVERSATIONS
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 11. CREATE RLS POLICIES FOR MESSAGES
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- 12. CREATE RLS POLICIES FOR PAYMENTS
CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 13. CREATE RLS POLICIES FOR VERIFICATIONS
CREATE POLICY "Users can view their verification"
  ON verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their verification"
  ON verifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications"
  ON verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 14. CREATE RLS POLICIES FOR BLOCKED_USERS
CREATE POLICY "Users can manage their blocked list"
  ON blocked_users FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 15. CREATE RLS POLICIES FOR USER_REPORTS
CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their reports"
  ON user_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage reports"
  ON user_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 16. CREATE RLS POLICIES FOR OTP_VERIFICATIONS
CREATE POLICY "Users can manage their OTPs"
  ON otp_verifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 17. CREATE FUNCTION TO AUTO-UPDATE TRUST SCORE
CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate trust score based on verifications
  NEW.trust_score := 0;
  
  IF NEW.phone_verified THEN
    NEW.trust_score := NEW.trust_score + 20;
  END IF;
  
  IF NEW.email_verified THEN
    NEW.trust_score := NEW.trust_score + 20;
  END IF;
  
  IF NEW.id_verified THEN
    NEW.trust_score := NEW.trust_score + 40;
  END IF;
  
  IF NEW.address_verified THEN
    NEW.trust_score := NEW.trust_score + 20;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trust_score_trigger
BEFORE INSERT OR UPDATE ON verifications
FOR EACH ROW EXECUTE FUNCTION update_trust_score();

-- 18. CREATE FUNCTION TO CLEAN EXPIRED OTPs
CREATE OR REPLACE FUNCTION clean_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications
  WHERE expires_at < NOW() AND verified = false;
END;
$$ LANGUAGE plpgsql;

-- 19. GRANT PERMISSIONS
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON payments TO authenticated;
GRANT ALL ON verifications TO authenticated;
GRANT ALL ON blocked_users TO authenticated;
GRANT ALL ON user_reports TO authenticated;
GRANT ALL ON otp_verifications TO authenticated;

-- 20. SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ PHASE 2 FEATURES MIGRATION COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ Conversations table created';
  RAISE NOTICE '✅ Messages table created';
  RAISE NOTICE '✅ Payments table created';
  RAISE NOTICE '✅ Verifications table created';
  RAISE NOTICE '✅ Blocked users table created';
  RAISE NOTICE '✅ User reports table created';
  RAISE NOTICE '✅ OTP verifications table created';
  RAISE NOTICE '✅ All indexes created';
  RAISE NOTICE '✅ All RLS policies created';
  RAISE NOTICE '✅ All triggers created';
  RAISE NOTICE '✅ All permissions granted';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 Ready for Phase 2 features!';
  RAISE NOTICE '==============================================';
END $$;
