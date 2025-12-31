import { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, CheckCheck } from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to real-time notifications
      const unsubscribe = notificationService.subscribeToNotifications(user.id, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Refresh notifications when panel opens to ensure count is accurate
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications(user.id);
      setNotifications(data);

      // Calculate unread count from fetched notifications to match what's displayed
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    // This function is now redundant but kept for compatibility
    // The count is calculated from fetched notifications
    if (!user) return;
    try {
      const data = await notificationService.getUserNotifications(user.id);
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await notificationService.markAsRead(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      }

      if (notification.link) {
        navigate(notification.link);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Check if the notification being deleted is unread
      const notification = notifications.find(n => n.id === id);
      const wasUnread = notification && !notification.read;

      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      // Update unread count if the deleted notification was unread
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!user) return;
    if (confirm('Are you sure you want to delete all notifications?')) {
      try {
        await notificationService.deleteAllNotifications(user.id);
        setNotifications([]);
        setUnreadCount(0);
      } catch (error) {
        console.error('Error deleting all notifications:', error);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      booking: '📅',
      message: '💬',
      review: '⭐',
      payment: '💰',
      system: '🔔',
      reminder: '⏰',
      approval: '✅',
      rejection: '❌',
      verification: '🆔',
    };
    return icons[type] || '🔔';
  };

  if (!user) return null;

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Actions */}
              {notifications.length > 0 && (
                <div className="p-3 sm:p-4 border-b border-gray-200 flex gap-2">
                  <button
                    onClick={handleMarkAllRead}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-amber-100 transition-colors active:scale-95"
                  >
                    <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Mark all read</span>
                    <span className="sm:hidden">Read All</span>
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-100 transition-colors active:scale-95"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Clear all</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Bell className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg font-semibold">No notifications</p>
                    <p className="text-gray-400 text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 cursor-pointer transition-colors ${notification.read ? 'bg-white hover:bg-gray-50' : 'bg-amber-50 hover:bg-amber-100'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-gray-900 text-sm">
                                {notification.title}
                              </p>
                              <button
                                onClick={(e) => handleDelete(notification.id, e)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <X className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
