import { useState, useEffect } from 'react';
import { Package, Check, X, Clock, Calendar, User, Mail, Phone, MapPin, DollarSign, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../utils/toast';
import { emailService } from '../../services/emailService';

interface Booking {
  id: string;
  listing_id: string;
  renter_id: string;
  renter_name: string;
  renter_email: string;
  renter_phone: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_price: number;
  item_price: number;
  platform_commission: number;
  delivery_charge: number;
  security_deposit: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  rejection_reason?: string;
  approved_at?: string;
  rejected_at?: string;
  listings: {
    title: string;
    images: string[];
    owner_name: string;
    contact_info: string;
    location: string;
  };
}

export const OrdersManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'rejected'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('bookings')
        .select(`
          *,
          listings (
            title,
            images,
            owner_name,
            contact_info,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }
      
      console.log('Fetched bookings:', data);
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (booking: Booking) => {
    setProcessing(booking.id);
    try {
      console.log('Approving booking:', booking.id);
      
      // Update booking status
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          approved_at: new Date().toISOString()
        } as any)
        .eq('id', booking.id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Booking approved in database');

      // Send email notification
      try {
        await emailService.sendBookingConfirmation({
          orderId: booking.id,
          itemTitle: booking.listings.title,
          startDate: new Date(booking.start_date).toLocaleDateString('en-IN'),
          endDate: new Date(booking.end_date).toLocaleDateString('en-IN'),
          totalDays: booking.total_days,
          itemPrice: booking.item_price,
          serviceCharge: booking.platform_commission,
          deliveryCharge: booking.delivery_charge,
          securityDeposit: booking.security_deposit,
          totalPrice: booking.total_price,
          paymentMethod: booking.payment_method === 'cash' ? 'Cash' : 'UPI',
          isRenter: true,
          contactName: booking.listings.owner_name,
          contactPhone: booking.listings.contact_info,
          contactAddress: booking.listings.location,
          dashboardUrl: `${window.location.origin}/dashboard`,
          email: booking.renter_email,
        });

        // Also send to owner
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', booking.owner_id)
          .single();

        if (ownerProfile) {
          await emailService.sendBookingConfirmation({
            orderId: booking.id,
            itemTitle: booking.listings.title,
            startDate: new Date(booking.start_date).toLocaleDateString('en-IN'),
            endDate: new Date(booking.end_date).toLocaleDateString('en-IN'),
            totalDays: booking.total_days,
            itemPrice: booking.item_price,
            serviceCharge: booking.platform_commission,
            deliveryCharge: booking.delivery_charge,
            securityDeposit: booking.security_deposit,
            totalPrice: booking.total_price,
            paymentMethod: booking.payment_method === 'cash' ? 'Cash' : 'UPI',
            isRenter: false,
            contactName: booking.renter_name,
            contactPhone: booking.renter_phone,
            contactAddress: 'Will be shared by admin',
            dashboardUrl: `${window.location.origin}/dashboard`,
            email: ownerProfile.email,
          });
        }

        showToast.success('Booking approved! Emails sent to both parties.');
      } catch (emailError) {
        console.error('Email error:', emailError);
        showToast.success('Booking approved! (Email notification pending)');
      }

      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error approving booking:', error);
      showToast.error('Failed to approve booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (booking: Booking) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setProcessing(booking.id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString()
        } as any)
        .eq('id', booking.id);

      if (error) throw error;

      showToast.success('Booking rejected');
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error rejecting booking:', error);
      showToast.error('Failed to reject booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelOrder = async (booking: Booking) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    setProcessing(booking.id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          rejection_reason: reason,
          rejected_at: new Date().toISOString()
        } as any)
        .eq('id', booking.id);

      if (error) throw error;

      showToast.success('Order cancelled successfully');
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast.error('Failed to cancel order');
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdatePaymentStatus = async (booking: Booking, newStatus: 'pending' | 'completed' | 'failed') => {
    setProcessing(booking.id);
    try {
      console.log('Updating payment status for booking:', booking.id, 'to:', newStatus);
      
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          payment_status: newStatus
        })
        .eq('id', booking.id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Payment status updated successfully:', data);
      showToast.success(`Payment status updated to ${newStatus.toUpperCase()}`);
      
      // Refresh the bookings list
      await fetchBookings();
      
      // Update the selected booking to show new status
      if (selectedBooking && selectedBooking.id === booking.id) {
        setSelectedBooking({ ...selectedBooking, payment_status: newStatus });
      }
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      showToast.error(error.message || 'Failed to update payment status');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Orders Management</h2>
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">View and manage all bookings</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
          {['all', 'pending', 'confirmed', 'completed', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Confirmed</p>
              <p className="text-2xl font-bold text-green-800">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-blue-800">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-800">
                ₹{bookings.reduce((sum, b) => sum + (b.platform_commission || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Item Image */}
                <img
                  src={booking.listings.images[0] || '/placeholder.jpg'}
                  alt={booking.listings.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />

                {/* Booking Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{booking.listings.title}</h3>
                      <p className="text-sm text-gray-600">Order ID: {booking.id.slice(0, 8)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Renter</p>
                      <p className="font-semibold">{booking.renter_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Owner</p>
                      <p className="font-semibold">{booking.listings.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-semibold">{booking.total_days} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-semibold text-primary">₹{booking.total_price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(booking.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                    >
                      View Details
                    </button>
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(booking)}
                          disabled={processing === booking.id}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-1"
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
                          onClick={() => handleReject(booking)}
                          disabled={processing === booking.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl sm:rounded-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Item Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Item Information</h3>
                <div className="flex gap-4">
                  <img
                    src={selectedBooking.listings.images[0]}
                    alt={selectedBooking.listings.title}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-bold text-xl">{selectedBooking.listings.title}</p>
                    <p className="text-gray-600 mt-2">Order ID: {selectedBooking.id}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getStatusBadge(selectedBooking.status)}`}>
                      {selectedBooking.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Renter Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Renter Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{selectedBooking.renter_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedBooking.renter_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedBooking.renter_phone}</p>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Owner Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{selectedBooking.listings.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-semibold">{selectedBooking.listings.contact_info}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{selectedBooking.listings.location}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-semibold">{new Date(selectedBooking.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-semibold">{new Date(selectedBooking.end_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{selectedBooking.total_days} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold">{selectedBooking.payment_method.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Pricing Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Fee</span>
                    <span className="font-semibold">₹{selectedBooking.item_price || 0}</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 my-2">
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Platform Commission (15%)</span>
                      <span className="font-semibold">₹{selectedBooking.platform_commission || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-700 mt-1">
                      <span>Owner Receives (85%)</span>
                      <span className="font-semibold">₹{(selectedBooking.item_price || 0) - (selectedBooking.platform_commission || 0)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit (20%)</span>
                    <span className="font-semibold">₹{selectedBooking.security_deposit || 0}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary border-t pt-2">
                    <span>CUSTOMER PAYS</span>
                    <span>₹{selectedBooking.total_price || 0}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status Control */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Payment Status</h3>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Current Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedBooking.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedBooking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedBooking.payment_status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleUpdatePaymentStatus(selectedBooking, 'completed')}
                    disabled={processing === selectedBooking.id || selectedBooking.payment_status === 'completed'}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as Paid
                  </button>
                  <button
                    onClick={() => handleUpdatePaymentStatus(selectedBooking, 'pending')}
                    disabled={processing === selectedBooking.id || selectedBooking.payment_status === 'pending'}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as Pending
                  </button>
                  <button
                    onClick={() => handleUpdatePaymentStatus(selectedBooking, 'failed')}
                    disabled={processing === selectedBooking.id || selectedBooking.payment_status === 'failed'}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark as Failed
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-3">
              {selectedBooking.status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedBooking)}
                    disabled={processing === selectedBooking.id}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing === selectedBooking.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Approve & Send Emails
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(selectedBooking)}
                    disabled={processing === selectedBooking.id}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
              {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'completed') && (
                <button
                  onClick={() => handleCancelOrder(selectedBooking)}
                  disabled={processing === selectedBooking.id}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel Order
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
