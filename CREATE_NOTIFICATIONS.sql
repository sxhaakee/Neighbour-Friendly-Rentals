-- ============================================
-- CREATE NOTIFICATIONS TABLE & TEST DATA
-- ============================================
-- This creates the notifications table and adds some test notifications

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('booking', 'message', 'review', 'payment', 'system', 'reminder', 'approval', 'rejection', 'verification')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 3. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- 5. Create RLS policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Add some test notifications (replace 'your-user-id' with actual user ID)
-- Get your user ID from Supabase Dashboard > Authentication > Users
-- Or run: SELECT id FROM auth.users WHERE email = 'your-email@example.com';

DO $$
DECLARE
    test_user_id UUID := 'your-user-id-here'; -- REPLACE THIS with your actual user ID
BEGIN
    -- Test notifications
    INSERT INTO notifications (user_id, type, title, message, link, read) VALUES
    (test_user_id, 'system', '🎉 Welcome to NFRR!', 'Your account has been successfully created. Start exploring rentals!', '/dashboard', FALSE),
    (test_user_id, 'booking', '📅 New Booking Request', 'Someone wants to book your camera! Check your dashboard.', '/dashboard?tab=owner-bookings', FALSE),
    (test_user_id, 'approval', '✅ Listing Approved', 'Your "Canon EOS Camera" listing is now live!', '/item/test-listing-id', TRUE),
    (test_user_id, 'reminder', '⏰ Payment Reminder', 'Your rental payment of ₹500 is due tomorrow.', '/dashboard?tab=my-bookings', FALSE),
    (test_user_id, 'review', '⭐ New Review', 'Someone left a 5-star review on your listing!', '/dashboard?tab=my-listings', TRUE);

    RAISE NOTICE '✅ Added 5 test notifications';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Error adding test notifications: %', SQLERRM;
END $$;

-- 7. Show success message
RAISE NOTICE '';
RAISE NOTICE '==============================================';
RAISE NOTICE '🎉 Notifications system created successfully!';
RAISE NOTICE '==============================================';
RAISE NOTICE '';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Replace "your-user-id-here" with your actual user ID';
RAISE NOTICE '2. Get your user ID from: Supabase Dashboard > Authentication > Users';
RAISE NOTICE '3. Or run: SELECT id FROM auth.users WHERE email = ''your-email@example.com'';';
RAISE NOTICE '4. Refresh your app and click the bell icon to see notifications!';
RAISE NOTICE '';
