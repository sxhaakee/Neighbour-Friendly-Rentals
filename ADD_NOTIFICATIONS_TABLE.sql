-- ============================================
-- CREATE NOTIFICATIONS TABLE
-- ============================================
-- This table stores all user notifications
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '📬 Creating Notifications Table';
  RAISE NOTICE '==============================================';

  -- Create notifications table
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('booking', 'message', 'review', 'payment', 'system', 'reminder', 'approval', 'rejection', 'verification')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  RAISE NOTICE '✅ Notifications table created';

  -- Create indexes
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    RAISE NOTICE '✅ Created index for user_id';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Index for user_id already exists';
  END;

  BEGIN
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = FALSE;
    RAISE NOTICE '✅ Created index for unread notifications';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Index for unread notifications already exists';
  END;

  BEGIN
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    RAISE NOTICE '✅ Created index for created_at';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Index for created_at already exists';
  END;

  -- Enable RLS
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  RAISE NOTICE '✅ RLS enabled for notifications';

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
  DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

  -- Create RLS policies
  CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

  CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

  RAISE NOTICE '✅ RLS policies created';

  -- Create function to automatically create notification on new booking
  CREATE OR REPLACE FUNCTION notify_new_booking()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Notify the owner of the listing
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.owner_id,
      'booking',
      'New Booking Request',
      'You have a new booking request for ' || (SELECT title FROM listings WHERE id = NEW.listing_id LIMIT 1),
      '/dashboard'
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  RAISE NOTICE '✅ Created notify_new_booking function';

  -- Drop existing trigger if it exists
  DROP TRIGGER IF EXISTS on_booking_created ON bookings;

  -- Create trigger for new bookings
  CREATE TRIGGER on_booking_created
    AFTER INSERT ON bookings
    FOR EACH ROW
    WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION notify_new_booking();

  RAISE NOTICE '✅ Created trigger for new bookings';

  -- Create function to notify on booking status change
  CREATE OR REPLACE FUNCTION notify_booking_status_change()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Only notify if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      -- Notify the renter
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        NEW.renter_id,
        CASE 
          WHEN NEW.status = 'confirmed' THEN 'approval'
          WHEN NEW.status = 'rejected' THEN 'rejection'
          WHEN NEW.status = 'completed' THEN 'system'
          ELSE 'booking'
        END,
        CASE 
          WHEN NEW.status = 'confirmed' THEN 'Booking Confirmed!'
          WHEN NEW.status = 'rejected' THEN 'Booking Rejected'
          WHEN NEW.status = 'completed' THEN 'Booking Completed'
          WHEN NEW.status = 'cancelled' THEN 'Booking Cancelled'
          ELSE 'Booking Status Updated'
        END,
        'Your booking status has been updated to: ' || NEW.status,
        '/dashboard'
      );
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  RAISE NOTICE '✅ Created notify_booking_status_change function';

  -- Drop existing trigger if it exists
  DROP TRIGGER IF EXISTS on_booking_status_changed ON bookings;

  -- Create trigger for booking status changes
  CREATE TRIGGER on_booking_status_changed
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_booking_status_change();

  RAISE NOTICE '✅ Created trigger for booking status changes';

  RAISE NOTICE '==============================================';
  RAISE NOTICE '🎉 Notifications table created successfully!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📝 WHAT THIS DOES:';
  RAISE NOTICE '✅ Creates notifications table';
  RAISE NOTICE '✅ Automatically notifies owners of new bookings';
  RAISE NOTICE '✅ Automatically notifies renters of status changes';
  RAISE NOTICE '✅ Enables real-time notification updates';
  RAISE NOTICE '==============================================';
END $$;
