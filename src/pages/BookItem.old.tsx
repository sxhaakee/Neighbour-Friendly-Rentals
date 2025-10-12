import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { Database } from '../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];

const BookItem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) {
      fetchListing();
    }
  }, [user, id, navigate]);

  useEffect(() => {
    if (startDate && endDate) {
      calculateTotal();
    }
  }, [startDate, endDate]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const data = await listingService.getListingById(id!);
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0 && listing) {
      setTotalDays(diffDays);
      setTotalPrice(diffDays * listing.price);
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  };

  const handleBooking = async () => {
    if (!user || !profile || !listing) return;

    if (!startDate || !endDate) {
      setError('Please select start and end dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date');
      return;
    }

    if (new Date(startDate) < new Date()) {
      setError('Start date cannot be in the past');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Check availability
      const isAvailable = await bookingService.checkAvailability(
        listing.id,
        startDate,
        endDate
      );

      if (!isAvailable) {
        setError('This item is not available for the selected dates');
        setProcessing(false);
        return;
      }

      // Create booking
      const booking = await bookingService.createBooking({
        listing_id: listing.id,
        renter_id: user.id,
        renter_name: profile.full_name || profile.email,
        renter_email: profile.email,
        owner_id: listing.owner_id,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending',
      });

      // Initiate payment
      await paymentService.displayRazorpay(
        totalPrice,
        booking.id,
        {
          name: profile.full_name || profile.email,
          email: profile.email,
          phone: profile.phone || undefined,
        },
        async (paymentId, orderId) => {
          // Payment successful
          try {
            await bookingService.updatePaymentStatus(booking.id, 'paid', paymentId);
            await bookingService.confirmBooking(booking.id);
            alert('Booking confirmed! You will receive a confirmation email.');
            navigate('/dashboard');
          } catch (error) {
            console.error('Error updating booking:', error);
            setError('Payment successful but failed to update booking. Please contact support.');
          }
        },
        () => {
          // Payment cancelled
          setError('Payment was cancelled');
          setProcessing(false);
        }
      );
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
          <button
            onClick={() => navigate('/listings')}
            className="text-primary hover:underline"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Book Your Rental</h1>
            <p className="text-white/90">Complete your booking details</p>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Item Details */}
            <div className="flex gap-6 mb-8 pb-8 border-b border-gray-200">
              <img
                src={listing.images[0] || '/placeholder.jpg'}
                alt={listing.title}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h2>
                <p className="text-gray-600 mb-2">{listing.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-primary">
                    ₹{listing.price}<span className="text-sm text-gray-500">/day</span>
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {listing.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={today}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || today}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Price Summary */}
              {totalDays > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-50 rounded-lg p-6 space-y-3"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
                  <div className="flex justify-between text-gray-600">
                    <span>Daily Rate:</span>
                    <span>₹{listing.price}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>
                      <Clock className="w-4 h-4 inline mr-1" />
                      Number of Days:
                    </span>
                    <span>{totalDays} days</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total Amount:</span>
                      <span className="text-primary">₹{totalPrice}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Owner Contact */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Owner Details</h4>
                <p className="text-gray-600">
                  <strong>Name:</strong> {listing.owner_name}
                </p>
                <p className="text-gray-600">
                  <strong>Contact:</strong> {listing.contact_info}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  disabled={processing || !startDate || !endDate || totalDays === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:from-primary/90 hover:to-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>

              {/* Payment Info */}
              <div className="text-center text-sm text-gray-500 pt-4">
                <p>🔒 Secure payment powered by Razorpay</p>
                <p className="mt-1">Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookItem;
