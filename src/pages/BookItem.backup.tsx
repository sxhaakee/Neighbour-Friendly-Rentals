import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { bookingService } from '../services/bookingService';
import { Database } from '../lib/database.types';
import { showToast } from '../utils/toast';
import { RentalAgreement } from '../components/Agreement/RentalAgreement';

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
  const [showAgreement, setShowAgreement] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  
  // Renter details
  const [renterPhone, setRenterPhone] = useState('');
  const [renterAddress, setRenterAddress] = useState('');

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

  useEffect(() => {
    if (profile) {
      setRenterPhone(profile.phone || '');
      setRenterAddress(profile.location || '');
    }
  }, [profile]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const data = await listingService.getListingById(id!);
      setListing(data as any);
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
      setTotalPrice(diffDays * (listing as any).price);
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  };

  const handleProceedToAgreement = () => {
    if (!startDate || !endDate) {
      showToast.error('Please select start and end dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      showToast.error('End date must be after start date');
      return;
    }

    if (new Date(startDate) < new Date()) {
      showToast.error('Start date cannot be in the past');
      return;
    }

    if (!renterPhone || !renterAddress) {
      showToast.error('Please provide your phone number and address');
      return;
    }

    setShowAgreement(true);
  };

  const handleAgreeAndBook = async () => {
    if (!user || !profile || !listing) return;

    setProcessing(true);
    setShowAgreement(false);

    try {
      // Check availability
      const isAvailable = await bookingService.checkAvailability(
        (listing as any).id,
        startDate,
        endDate
      );

      if (!isAvailable) {
        showToast.error('This item is not available for the selected dates');
        setProcessing(false);
        return;
      }

      // Create booking with pending payment
      const booking = await bookingService.createBooking({
        listing_id: (listing as any).id,
        renter_id: user.id,
        renter_name: profile.full_name || profile.email,
        renter_email: profile.email,
        owner_id: (listing as any).owner_id,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending',
      });

      showToast.success('Booking created! Please pay via ' + (paymentMethod === 'cash' ? 'Cash' : 'UPI') + ' on delivery.');
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      showToast.error(err instanceof Error ? err.message : 'Failed to create booking');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
          <button
            onClick={() => navigate('/listings')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const typedListing = listing as any;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Item</h1>
          <p className="text-gray-600">Complete your booking details</p>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">Item Details</h2>
              <div className="flex gap-4">
                <img
                  src={typedListing.images[0]}
                  alt={typedListing.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">{typedListing.title}</h3>
                  <p className="text-gray-600 text-sm">{typedListing.category}</p>
                  <p className="text-primary font-semibold mt-2">₹{typedListing.price}/day</p>
                </div>
              </div>
            </motion.div>

            {/* Rental Period */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rental Period
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">Your Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={renterPhone}
                    onChange={(e) => setRenterPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={renterAddress}
                    onChange={(e) => setRenterAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your complete address"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                    className="w-4 h-4 text-primary"
                  />
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay in cash when you receive the item</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'upi')}
                    className="w-4 h-4 text-primary"
                  />
                  <div>
                    <p className="font-semibold">UPI on Delivery</p>
                    <p className="text-sm text-gray-600">Pay via UPI when you receive the item</p>
                  </div>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg sticky top-24"
            >
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per day</span>
                  <span className="font-semibold">₹{typedListing.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Clock size={16} />
                    Duration
                  </span>
                  <span className="font-semibold">{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToAgreement}
                disabled={processing || !totalDays}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Proceed to Agreement
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Payment will be collected on delivery via {paymentMethod === 'cash' ? 'Cash' : 'UPI'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Rental Agreement Modal */}
      {showAgreement && listing && profile && (
        <RentalAgreement
          listing={typedListing}
          renterName={profile.full_name || profile.email}
          renterPhone={renterPhone}
          renterAddress={renterAddress}
          ownerName={typedListing.owner_name}
          ownerPhone={typedListing.contact_info}
          ownerAddress={typedListing.location}
          startDate={startDate}
          endDate={endDate}
          totalDays={totalDays}
          totalPrice={totalPrice}
          orderId={`ORD-${Date.now()}`}
          onAgree={handleAgreeAndBook}
          onCancel={() => setShowAgreement(false)}
        />
      )}
    </div>
  );
};

export default BookItem;
