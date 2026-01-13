import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean | null;
  data?: any;
  created_at: string | null;
}

export interface NotificationInsert {
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: any;
}

export const notificationService = {
  // Get user notifications
  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return [];
    }
  },

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  },

  // Create notification
  async createNotification(notification: NotificationInsert): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark as read
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  },

  // Mark all as read
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Delete all notifications
  async deleteAllNotifications(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Helper: Notify listing approval
  async notifyListingApproval(ownerId: string, listingTitle: string, listingId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: ownerId,
        type: 'approval',
        title: '✅ Listing Approved!',
        message: `Your listing "${listingTitle}" has been approved and is now live!`,
        link: `/item/${listingId}`,
      });
    } catch (error) {
      console.error('Error creating approval notification:', error);
    }
  },

  // Helper: Notify listing rejection
  async notifyListingRejection(ownerId: string, listingTitle: string, reason?: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: ownerId,
        type: 'rejection',
        title: '❌ Listing Rejected',
        message: `Your listing "${listingTitle}" was rejected. ${reason ? `Reason: ${reason}` : 'Please contact support for details.'}`,
        link: '/dashboard',
      });
    } catch (error) {
      console.error('Error creating rejection notification:', error);
    }
  },

  // Helper: Notify service provider approval
  async notifyServiceApproval(ownerId: string, serviceName: string, serviceId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: ownerId,
        type: 'approval',
        title: '✅ Service Approved!',
        message: `Your service "${serviceName}" has been approved and is now visible to customers!`,
        link: `/service/${serviceId}`,
      });
    } catch (error) {
      console.error('Error creating service approval notification:', error);
    }
  },

  // Helper: Notify service provider rejection
  async notifyServiceRejection(ownerId: string, serviceName: string, reason?: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: ownerId,
        type: 'rejection',
        title: '❌ Service Rejected',
        message: `Your service "${serviceName}" was rejected. ${reason ? `Reason: ${reason}` : 'Please contact support for details.'}`,
        link: '/dashboard',
      });
    } catch (error) {
      console.error('Error creating service rejection notification:', error);
    }
  },

  // Helper: Notify property approval
  async notifyPropertyApproval(ownerId: string, propertyName: string, propertyId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: ownerId,
        type: 'approval',
        title: '✅ Property Approved!',
        message: `Your property "${propertyName}" has been approved and is now listed!`,
        link: `/property/${propertyId}`,
      });
    } catch (error) {
      console.error('Error creating property approval notification:', error);
    }
  },

  // Helper: Notify property rejection
  async notifyPropertyRejection(ownerId: string, propertyName: string, reason?: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: ownerId,
        type: 'rejection',
        title: '❌ Property Rejected',
        message: `Your property "${propertyName}" was rejected. ${reason ? `Reason: ${reason}` : 'Please contact support for details.'}`,
        link: '/dashboard',
      });
    } catch (error) {
      console.error('Error creating property rejection notification:', error);
    }
  },

  // Helper: Notify ID verification approval
  async notifyVerificationApproval(userId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: userId,
        type: 'verification',
        title: '✅ ID Verified!',
        message: 'Your ID verification has been approved. You can now book items!',
        link: '/dashboard',
      });
    } catch (error) {
      console.error('Error creating verification approval notification:', error);
    }
  },

  // Helper: Notify ID verification rejection
  async notifyVerificationRejection(userId: string, reason?: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: userId,
        type: 'verification',
        title: '❌ ID Verification Rejected',
        message: `Your ID verification was rejected. ${reason ? `Reason: ${reason}` : 'Please resubmit with valid documents.'}`,
        link: '/verify-id',
      });
    } catch (error) {
      console.error('Error creating verification rejection notification:', error);
    }
  },

  // Helper: Notify new booking (to owner)
  async notifyNewBooking(ownerId: string, renterName: string, itemTitle: string, bookingId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: ownerId,
        type: 'booking',
        title: '📅 New Booking Request!',
        message: `${renterName} wants to book your "${itemTitle}"`,
        link: `/dashboard?tab=owner-bookings&booking=${bookingId}`,
      });
    } catch (error) {
      console.error('Error creating booking notification:', error);
    }
  },

  // Helper: Notify booking confirmation (to renter)
  async notifyBookingConfirmation(renterId: string, itemTitle: string, bookingId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: renterId,
        type: 'booking',
        title: '✅ Booking Confirmed!',
        message: `Your booking for "${itemTitle}" has been confirmed!`,
        link: `/dashboard?tab=my-bookings&booking=${bookingId}`,
      });
    } catch (error) {
      console.error('Error creating booking confirmation notification:', error);
    }
  },

  // Helper: Notify admin of new listing (for approval)
  async notifyAdminNewListing(listingTitle: string, ownerName: string, listingId: string): Promise<void> {
    try {
      // Get all admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      // Send notification to all admins
      for (const admin of admins) {
        await this.createNotification({
          user_id: admin.id,
          type: 'system',
          title: '📦 New Listing for Approval',
          message: `${ownerName} listed "${listingTitle}" - Pending approval`,
          link: `/admin?tab=listings&filter=pending`,
        });
      }
    } catch (error) {
      console.error('Error notifying admins of new listing:', error);
    }
  },

  // Helper: Notify admin of new service (for approval)
  async notifyAdminNewService(serviceName: string, ownerName: string, serviceId: string): Promise<void> {
    try {
      // Get all admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      // Send notification to all admins
      for (const admin of admins) {
        await this.createNotification({
          user_id: admin.id,
          type: 'system',
          title: '🎉 New Service for Approval',
          message: `${ownerName} listed "${serviceName}" - Pending approval`,
          link: `/admin?tab=services&filter=pending`,
        });
      }
    } catch (error) {
      console.error('Error notifying admins of new service:', error);
    }
  },

  // Helper: Notify admin of new property (for approval)
  async notifyAdminNewProperty(propertyTitle: string, ownerName: string, propertyId: string): Promise<void> {
    try {
      // Get all admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      // Send notification to all admins
      for (const admin of admins) {
        await this.createNotification({
          user_id: admin.id,
          type: 'system',
          title: '🏠 New Property for Approval',
          message: `${ownerName} listed "${propertyTitle}" - Pending approval`,
          link: `/admin?tab=properties&filter=pending`,
        });
      }
    } catch (error) {
      console.error('Error notifying admins of new property:', error);
    }
  },
};
