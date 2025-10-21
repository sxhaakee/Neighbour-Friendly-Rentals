import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Clock, CheckCircle, AlertCircle, ArrowLeft, Video, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { bookingService } from '../services/bookingService';
import { verificationService } from '../services/verificationService';
import { rentalAgreementService } from '../services/rentalAgreementService';
import { notificationService } from '../services/notificationService';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { showToast } from '../utils/toast';
import { RentalAgreement } from '../components/Agreement/RentalAgreement';

type Listing = Database['public']['Tables']['listings']['Row'];

const BookItem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showAgreement, setShowAgreement] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [isVerified, setIsVerified] = useState(false);
  const [videoAcknowledged, setVideoAcknowledged] = useState(false);
  
  // Renter details
  const [renterPhone, setRenterPhone] = useState('');
  const [renterAddress, setRenterAddress] = useState('');

  // Pricing breakdown
  const [itemPrice, setItemPrice] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0); // 10% platform fee
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;
    
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    checkVerification();
    if (id) {
      fetchListing();
    }
  }, [user, authLoading, id, navigate]);

  useEffect(() => {
    if (startDate && endDate && listing) {
      calculateCharges();
    }
  }, [startDate, endDate, listing]);

  useEffect(() => {
    if (profile) {
      setRenterPhone(profile.phone || '');
      setRenterAddress(profile.location || '');
    }
  }, [profile]);

  const checkVerification = async () => {
    try {
      const verified = await verificationService.isUserVerified(user!.id);
      setIsVerified(verified);
    } catch (error) {
      console.error('Error checking verification:', error);
    }
  };

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

  const calculateCharges = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0 && listing) {
      const typedListing = listing as any;
      setTotalDays(diffDays);
      
      // Item price
      const itemTotal = typedListing.price * diffDays;
      setItemPrice(itemTotal);
      
      // Platform commission (20% deducted from rental fee)
      // Customer pays: itemTotal
      // Platform gets: 20% of itemTotal
      // Owner gets: 80% of itemTotal
      const commission = itemTotal * 0.20;
      setServiceCharge(commission);
      
      // Security deposit (20% of item price)
      const deposit = itemTotal * 0.20;
      setSecurityDeposit(deposit);
      
      // Grand total = rental fee (commission is deducted, not added)
      // Customer pays ONLY the rental fee
      // Platform takes commission from this amount
      const total = itemTotal;
      setGrandTotal(total);
    } else {
      setTotalDays(0);
      setItemPrice(0);
      setServiceCharge(0);
      setSecurityDeposit(0);
      setGrandTotal(0);
    }
  };

  const handleProceedToAgreement = () => {
    if (!isVerified) {
      showToast.error('Please verify your ID first');
      setTimeout(() => navigate('/verify-id'), 1500);
      return;
    }

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

    if (!videoAcknowledged) {
      showToast.error('Please acknowledge the video recording requirement');
      return;
    }

    setShowAgreement(true);
  };

  const handleAgreeAndBook = async () => {
    if (!user || !profile || !listing) return;

    setProcessing(true);
    setShowAgreement(false);

    try {
      const typedListing = listing as any;

      // Check availability
      const isAvailable = await bookingService.checkAvailability(
        typedListing.id,
        startDate,
        endDate
      );

      if (!isAvailable) {
        showToast.error('This item is already booked for the selected dates');
        setProcessing(false);
        return;
      }

      // Create booking with all charges
      const booking = await bookingService.createBooking({
        listing_id: typedListing.id,
        renter_id: user.id,
        renter_name: profile.full_name || profile.email,
        renter_email: profile.email,
        renter_phone: renterPhone || profile.phone || '',
        owner_id: typedListing.owner_id,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        total_price: Math.round(grandTotal),
        item_price: itemPrice,
        platform_commission: serviceCharge,
        service_charge: 0,
        delivery_charge: 0,
        gst_amount: 0,
        security_deposit: securityDeposit,
        delivery_opted: false,
        pickup_opted: false,
        payment_method: paymentMethod,
        status: 'pending',
        payment_status: 'pending',
      } as any);

      // Create rental agreement
      try {
        // Fetch owner profile for complete data
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('full_name, email, phone, address')
          .eq('id', typedListing.owner_id)
          .single();

        await rentalAgreementService.createAgreement({
          booking_id: booking.id,
          listing_id: typedListing.id,
          renter_id: user.id,
          owner_id: typedListing.owner_id,
          renter_name: profile.full_name || profile.email,
          renter_email: profile.email,
          renter_phone: renterPhone || profile.phone || '',
          owner_name: ownerProfile?.full_name || typedListing.owner_name || 'Owner',
          owner_email: ownerProfile?.email || typedListing.owner_email || '',
          owner_phone: ownerProfile?.phone || '',
          item_title: typedListing.title,
          item_description: typedListing.description,
          start_date: startDate,
          end_date: endDate,
          total_days: totalDays,
          total_price: Math.round(grandTotal),
          security_deposit: securityDeposit,
          agreement_data: {
            booking_id: booking.id,
            order_id: `ORD-${Date.now()}`,
            listing: {
              title: typedListing.title,
              description: typedListing.description,
              category: typedListing.category,
              price_per_day: typedListing.price_per_day,
            },
            renter: {
              name: profile.full_name || profile.email,
              email: profile.email,
              phone: renterPhone,
              address: renterAddress,
            },
            owner: {
              name: ownerProfile?.full_name || typedListing.owner_name || 'Owner',
              email: ownerProfile?.email || typedListing.owner_email || '',
              phone: ownerProfile?.phone || 'Not provided',
              address: ownerProfile?.address || 'Not provided',
            },
            rental_details: {
              start_date: startDate,
              end_date: endDate,
              total_days: totalDays,
              price_per_day: typedListing.price_per_day,
              item_price: itemPrice,
              service_charge: serviceCharge,
              delivery_charge: 0,
              security_deposit: securityDeposit,
              total_price: Math.round(grandTotal),
              payment_method: paymentMethod,
              delivery_opted: false,
            },
            agreed_at: new Date().toISOString(),
          },
        });
        console.log('Rental agreement created successfully');
      } catch (agreementError) {
        console.error('Error creating rental agreement:', agreementError);
        // Don't fail the booking if agreement creation fails
      }

      // Send notification to owner
      try {
        await notificationService.notifyNewBooking(
          typedListing.owner_id,
          profile.full_name || profile.email,
          typedListing.title,
          booking.id
        );
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }

      showToast.success('Booking created! Check your email for details.');
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      if (err.message?.includes('already booked')) {
        showToast.error('This item is already booked for the selected dates');
      } else {
        showToast.error(err instanceof Error ? err.message : 'Failed to create booking');
      }
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Verification Warning */}
        {!isVerified && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6"
          >
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-800">ID Verification Required</p>
                <p className="text-sm text-yellow-700 mt-1">
                  You need to verify your ID before booking. 
                  <button
                    onClick={() => navigate('/verify-id')}
                    className="underline ml-1 font-semibold"
                  >
                    Verify Now
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        )}

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

            {/* Video Recording Requirement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-6"
            >
              <div className="flex gap-3 mb-4">
                <Video className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900 text-lg mb-2">
                    Important: Video Recording Required
                  </h3>
                  <div className="text-sm text-red-800 space-y-2">
                    <p className="font-semibold">For dispute resolution, you MUST:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Record a clear video of the item during handover (pickup)</li>
                      <li>Show all sides, accessories, and condition</li>
                      <li>Record again during return</li>
                      <li>Videos will be stored until rental is completed without disputes</li>
                    </ul>
                    <p className="font-semibold mt-3">
                      Both lender and renter must record videos. Failure to do so may result in disputes being resolved against you.
                    </p>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  checked={videoAcknowledged}
                  onChange={(e) => setVideoAcknowledged(e.target.checked)}
                  className="w-5 h-5 text-primary"
                />
                <span className="font-semibold text-red-900">
                  I understand and agree to record videos during handover and return
                </span>
              </label>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
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
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-6 shadow-lg sticky top-24"
            >
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              {totalDays > 0 ? (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rental fee (₹{typedListing.price} × {totalDays} days)</span>
                    <span className="font-semibold">₹{itemPrice.toFixed(2)}</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 my-2">
                    <div className="flex justify-between text-xs text-green-700">
                      <span>Platform commission (20% - included)</span>
                      <span>₹{serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-700 mt-1">
                      <span>Owner receives (80%)</span>
                      <span>₹{(itemPrice - serviceCharge).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total Amount to Pay</span>
                    <span className="text-2xl font-bold text-primary">₹{Math.round(grandTotal)}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-blue-900 font-semibold">Security Deposit (20%)</span>
                      <span className="font-semibold text-blue-900">₹{securityDeposit.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      ℹ️ Not charged - For reference only. Deposit is held as trust, not paid.
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 italic mt-3">
                    💰 Payment on pickup: Rental fee + Service charge
                  </p>
                  <p className="text-xs text-gray-500 italic mt-1">
                    🔒 Service charge (10%) is for safe renting and trust
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-6">Select dates to see pricing</p>
              )}

              <button
                onClick={handleProceedToAgreement}
                disabled={processing || !totalDays || !isVerified || !videoAcknowledged}
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
                Payment via {paymentMethod === 'cash' ? 'Cash' : 'UPI'} on delivery
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
          totalPrice={Math.round(grandTotal)}
          orderId={`ORD-${Date.now()}`}
          onAgree={handleAgreeAndBook}
          onCancel={() => setShowAgreement(false)}
        />
      )}
    </div>
  );
};

export default BookItem;
