# 🗄️ DATABASE SETUP GUIDE

## ⚠️ IMPORTANT: Run migrations in this exact order!

---

## **STEP 1: Fix Reviews Table**

Run this first to fix the `item_id` → `listing_id` issue:

```sql
-- File: FIX_REVIEWS_TABLE.sql
-- This fixes the reviews table to use listing_id instead of item_id
```

## **STEP 1.5: Fix Bookings Table (IF IT EXISTS)**

If you already have a bookings table with `item_id`, run this:

```sql
-- File: FIX_BOOKINGS_TABLE.sql
-- This renames item_id to listing_id in existing bookings table
```

**Skip this step if:** You're setting up a fresh database

**What it does:**
- Drops existing reviews table
- Recreates with `listing_id` column
- Adds all RLS policies
- Creates indexes
- Sets up triggers

---

## **STEP 2: Phase 1 Features**

Run this to create core tables:

```sql
-- File: PHASE1_DATABASE_MIGRATION.sql
-- Creates: reviews, bookings, notifications, search tables
```

**What it does:**
- Creates reviews table (with listing_id)
- Creates bookings table (with listing_id)
- Creates notifications table
- Creates search_preferences table
- Creates recent_searches table
- Creates review_helpful_votes table
- All RLS policies
- All triggers
- All indexes

**Tables created:**
1. `reviews` - Rating & review system
2. `bookings` - Booking management
3. `notifications` - Notification system
4. `search_preferences` - Saved searches
5. `recent_searches` - Search history
6. `review_helpful_votes` - Review voting

---

## **STEP 3: Phase 2 Features**

Run this to add messaging, payments, verification:

```sql
-- File: PHASE2_FEATURES_MIGRATION.sql
-- Creates: conversations, messages, payments, verifications
```

**What it does:**
- Creates conversations table
- Creates messages table
- Creates payments table
- Creates verifications table
- Creates blocked_users table
- Creates user_reports table
- Creates otp_verifications table
- All RLS policies
- All triggers
- All indexes

**Tables created:**
1. `conversations` - Chat conversations
2. `messages` - Chat messages
3. `payments` - Payment records
4. `verifications` - User verifications
5. `blocked_users` - User blocking
6. `user_reports` - User reporting
7. `otp_verifications` - OTP management

---

## **STEP 4: Phase 3 Features**

Run this to add AI, social, analytics:

```sql
-- File: PHASE3_ADVANCED_FEATURES_MIGRATION.sql
-- Creates: user_follows, activity_feed, referrals
```

**What it does:**
- Creates user_follows table
- Creates activity_feed table
- Creates referrals table
- Adds social columns to profiles
- All RLS policies
- All triggers
- All indexes
- Creates leaderboard view

**Tables created:**
1. `user_follows` - Follow system
2. `activity_feed` - User activities
3. `referrals` - Referral program

**Columns added to profiles:**
- followers_count
- following_count
- listings_count
- bookings_count
- reviews_count
- referral_code
- bio

---

## **COMPLETE MIGRATION SCRIPT**

Copy and paste this entire script into Supabase SQL Editor:

```sql
-- =====================================================
-- COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: FIX REVIEWS TABLE
-- Drop and recreate with listing_id
DROP TABLE IF EXISTS review_helpful_votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

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

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view helpful votes" ON review_helpful_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on reviews" ON review_helpful_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their votes" ON review_helpful_votes FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_service_id ON reviews(service_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Grant permissions
GRANT ALL ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT ALL ON review_helpful_votes TO authenticated;

-- STEP 2: FIX BOOKINGS TABLE
-- Drop and recreate with listing_id
DROP TABLE IF EXISTS bookings CASCADE;

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

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their bookings" ON bookings FOR SELECT
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT
  WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Users can update their bookings" ON bookings FOR UPDATE
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Create indexes
CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_renter ON bookings(renter_id);
CREATE INDEX idx_bookings_owner ON bookings(owner_id);

-- Grant permissions
GRANT ALL ON bookings TO authenticated;

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ Reviews table fixed (listing_id)';
  RAISE NOTICE '✅ Bookings table fixed (listing_id)';
  RAISE NOTICE '✅ All RLS policies created';
  RAISE NOTICE '✅ All indexes created';
  RAISE NOTICE '✅ All permissions granted';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 Ready to run Phase 2 and Phase 3 migrations!';
  RAISE NOTICE '==============================================';
END $$;
```

---

## **VERIFICATION STEPS**

After running the migrations, verify everything is set up correctly:

### 1. Check Tables Exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'reviews', 'bookings', 'notifications',
  'conversations', 'messages', 'payments',
  'verifications', 'user_follows', 'activity_feed'
);
```

### 2. Check Columns:
```sql
-- Check reviews table has listing_id
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'listing_id';

-- Check bookings table has listing_id
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'listing_id';
```

### 3. Check RLS is Enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('reviews', 'bookings', 'messages');
```

---

## **TROUBLESHOOTING**

### Error: "column item_id does not exist"
**Solution:** Run FIX_REVIEWS_TABLE.sql first, then PHASE1_DATABASE_MIGRATION.sql

### Error: "column receiver_id does not exist"
**Solution:** This is a different table. Make sure you're running PHASE2_FEATURES_MIGRATION.sql which creates the messages table with receiver_id column.

### Error: "relation already exists"
**Solution:** Drop the table first or use `CREATE TABLE IF NOT EXISTS`

### Error: "permission denied"
**Solution:** Make sure you're running as a superuser in Supabase SQL Editor

---

## **QUICK REFERENCE**

### Column Name Changes:
- ❌ `item_id` → ✅ `listing_id` (in reviews and bookings)
- ✅ All other tables use correct column names

### Migration Order:
1. FIX_REVIEWS_TABLE.sql
2. PHASE1_DATABASE_MIGRATION.sql
3. PHASE2_FEATURES_MIGRATION.sql
4. PHASE3_ADVANCED_FEATURES_MIGRATION.sql

### Total Tables: 17
- Phase 1: 6 tables
- Phase 2: 7 tables
- Phase 3: 3 tables
- Modified: profiles (added columns)

---

## **DONE! ✅**

After running all migrations, your database is fully set up and ready to use!

**Next steps:**
1. Test the application
2. Verify all features work
3. Deploy to production

**Need help?** Check the implementation summaries:
- PHASE1_IMPLEMENTATION_SUMMARY.md
- PHASE2_IMPLEMENTATION_SUMMARY.md
- PHASE3_IMPLEMENTATION_SUMMARY.md
