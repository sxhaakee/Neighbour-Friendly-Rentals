import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, IndianRupee, AlertCircle, AlertTriangle } from 'lucide-react';
import { bookingService, BookingInsert } from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';
import { motion } from 'framer-motion';
import { RentalAgreement } from './Agreement/RentalAgreement';

interface BookingCalendarProps {
  type: 'item' | 'property' | 'service';
  id: string;
  ownerId: string;
  price?: number;
  title: string;
}

export const BookingCalendar = ({ type, id, ownerId, price, title }: BookingCalendarProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const isVerified = false; // Set to false to always show verification note - replace with actual check later
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<BookingInsert | null>(null);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const totalPrice = price ? calculateDays() * price : 0;

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      showToast.error('Please select dates');
      return;
    }

    try {
      setChecking(true);
      const isAvailable = await bookingService.checkAvailability(id, startDate, endDate);
      setAvailable(isAvailable);
      if (!isAvailable) {
        showToast.error('These dates are not available');
      } else {
        showToast.success('Dates are available!');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      showToast.error('Failed to check availability');
    } finally {
      setChecking(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      showToast.error('Please sign in to make a booking');
      return;
    }

    if (user.id === ownerId) {
      showToast.error('You cannot book your own listing');
      return;
    }

    if (!startDate || !endDate) {
      showToast.error('Please select dates');
      return;
    }

    if (available === false) {
      showToast.error('Please select available dates');
      return;
    }

    try {
      setSubmitting(true);
      const bookingData: BookingInsert = {
        listing_id: id,
        renter_id: user.id,
        owner_id: ownerId,
        start_date: startDate,
        end_date: endDate,
        total_days: calculateDays(),
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        total_price: totalPrice,
        renter_name: user.user_metadata?.full_name || user.email || 'Guest',
        renter_email: user.email || '',
        notes: notes.trim() || undefined,
        special_requests: specialRequests.trim() || undefined,
        status: 'pending'
      };

      if (type === 'property') bookingData.property_id = id;
      else if (type === 'service') bookingData.service_id = id;

      // Store booking data and show agreement
      setPendingBookingData(bookingData);
      setShowAgreement(true);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      showToast.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAgreeToAgreement = async () => {
    if (!pendingBookingData) return;

    try {
      setSubmitting(true);
      await bookingService.createBooking(pendingBookingData);

      showToast.success('Booking confirmed! Redirecting to My Bookings...');

      // Reset form
      setStartDate('');
      setEndDate('');
      setStartTime('');
      setEndTime('');
      setNotes('');
      setSpecialRequests('');
      setAvailable(null);
      setShowAgreement(false);
      setPendingBookingData(null);

      // Redirect to My Bookings page
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      showToast.error(error.message || 'Failed to confirm booking');
      setShowAgreement(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAgreement = () => {
    setShowAgreement(false);
    setPendingBookingData(null);
    setSubmitting(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Book {title}</h3>

      {/* Verification Note for Unverified Users */}
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">Verification Recommended</p>
              <p className="text-xs text-blue-700">
                Verify your account to build trust with owners and increase your booking approval chances.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {price && (
        <div className="flex items-center gap-2 mb-6 p-4 bg-primary/5 rounded-lg">
          <IndianRupee className="w-6 h-6 text-amber-600" />
          <div>
            <p className="text-3xl font-bold text-amber-600">₹{price}</p>
            <p className="text-sm text-gray-600">per day</p>
          </div>
        </div>
      )}

      {/* Date Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setAvailable(null);
            }}
            min={today}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setAvailable(null);
            }}
            min={startDate || today}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Time Selection (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any special requirements..."
            rows={2}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Availability Status */}
      {available !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${available ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'
            }`}
        >
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-semibold">
            {available ? 'Available for these dates!' : 'Not available for these dates'}
          </p>
        </motion.div>
      )}

      {/* Price Summary */}
      {price && startDate && endDate && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">₹{price} × {calculateDays()} days</span>
            <span className="font-semibold">₹{totalPrice}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span className="text-amber-600">₹{totalPrice}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={checkAvailability}
          disabled={checking || !startDate || !endDate}
          className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          {checking ? 'Checking...' : 'Check Availability'}
        </button>

        <button
          onClick={handleBooking}
          disabled={submitting || !startDate || !endDate || available === false}
          className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Booking...' : 'Request Booking'}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        You won't be charged yet. The owner will review your request.
      </p>

      {/* Rental Agreement Modal */}
      {showAgreement && pendingBookingData && (
        <RentalAgreement
          listing={{ title, condition: 'Good' }}
          renterName={user?.user_metadata?.full_name || user?.email || 'User'}
          renterPhone={user?.phone || 'Not provided'}
          renterAddress="Address on file"
          ownerName="Owner"
          ownerPhone="Owner Phone"
          ownerAddress="Owner Address"
          startDate={startDate}
          endDate={endDate}
          totalDays={calculateDays()}
          totalPrice={totalPrice}
          orderId={`ORD-${Date.now()}`}
          onAgree={handleAgreeToAgreement}
          onCancel={handleCancelAgreement}
        />
      )}
    </div>
  );
};
