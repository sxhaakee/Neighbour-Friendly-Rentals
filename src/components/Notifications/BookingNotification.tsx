import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/toast';

interface Booking {
  id: string;
  listing_id: string;
  renter_name: string;
  renter_email: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
  listings: {
    title: string;
    images: string[];
  };
}

export const BookingNotification = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPendingBookings();
      
      // Subscribe to new bookings
      const channel = supabase
        .channel('booking-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bookings',
            filter: isAdmin ? undefined : `owner_id=eq.${user.id}`,
          },
          () => {
            fetchPendingBookings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isAdmin]);

  const fetchPendingBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          listings (
            title,
            images
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // If not admin, only show bookings for user's listings
      if (!isAdmin) {
        query = query.eq('owner_id', user!.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPendingBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleApprove = async (bookingId: string) => {
    setProcessing(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          payment_status: 'pending'
        } as any)
        .eq('id', bookingId);

      if (error) throw error;

      showToast.success('Booking approved! Waiting for payment.');
      fetchPendingBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      showToast.error('Failed to approve booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setProcessing(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'rejected',
          rejection_reason: reason
        } as any)
        .eq('id', bookingId);

      if (error) throw error;

      showToast.success('Booking rejected');
      fetchPendingBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      showToast.error('Failed to reject booking');
    } finally {
      setProcessing(null);
    }
  };

  if (pendingBookings.length === 0) return null;

  return (
    <>
      {/* Notification Bell */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setShowNotifications(!showNotifications)}
        className="fixed top-20 right-6 z-40 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
      >
        <Bell className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {pendingBookings.length}
        </span>
      </motion.button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-32 right-6 z-40 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Bell className="w-5 h-5" />
                <h3 className="font-bold">New Bookings</h3>
                <span className="bg-white text-amber-600 px-2 py-0.5 rounded-full text-sm font-bold">
                  {pendingBookings.length}
                </span>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bookings List */}
            <div className="overflow-y-auto max-h-[500px]">
              {pendingBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border-b border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex gap-3">
                    {/* Item Image */}
                    <img
                      src={booking.listings.images[0] || '/placeholder.jpg'}
                      alt={booking.listings.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />

                    {/* Booking Details */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {booking.listings.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Renter: {booking.renter_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-bold text-amber-600 mt-1">
                        ₹{booking.total_price}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(booking.id)}
                      disabled={processing === booking.id}
                      className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {processing === booking.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      disabled={processing === booking.id}
                      className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View All */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowNotifications(false);
                  navigate(isAdmin ? '/admin' : '/dashboard');
                }}
                className="w-full text-center text-amber-600 font-semibold text-sm hover:underline"
              >
                View All Bookings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
