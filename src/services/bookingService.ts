import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export const bookingService = {
  // Create booking
  async createBooking(booking: BookingInsert) {
    console.log('Creating booking with data:', booking);
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) {
      console.error('Booking creation error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('Booking created successfully:', data);
    return data;
  },

  // Get user's bookings (as renter)
  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listings:listing_id (
          title,
          images,
          category,
          price
        )
      `)
      .eq('renter_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get owner's bookings (items they own that are rented)
  async getOwnerBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listings:listing_id (
          title,
          images,
          category,
          price
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all bookings (admin only)
  async getAllBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listings:listing_id (
          title,
          images,
          category
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get booking by ID
  async getBookingById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listings:listing_id (
          title,
          images,
          category,
          price,
          owner_name,
          owner_email,
          contact_info
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update booking
  async updateBooking(id: string, updates: BookingUpdate) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update payment status
  async updatePaymentStatus(
    bookingId: string,
    paymentStatus: 'paid' | 'refunded',
    razorpayPaymentId?: string
  ) {
    const updates: BookingUpdate = {
      payment_status: paymentStatus,
    };

    if (razorpayPaymentId) {
      updates.razorpay_payment_id = razorpayPaymentId;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Confirm booking
  async confirmBooking(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Cancel booking
  async cancelBooking(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Complete booking
  async completeBooking(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check if dates are available for a listing
  async checkAvailability(listingId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('listing_id', listingId)
      .in('status', ['pending', 'confirmed']);

    if (error) throw error;

    // Check for date overlaps manually
    // Two bookings overlap if:
    // (StartA <= EndB) AND (EndA >= StartB)
    const hasOverlap = data.some(booking => {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      const requestStart = new Date(startDate);
      const requestEnd = new Date(endDate);

      // Check if dates overlap
      return (requestStart <= bookingEnd && requestEnd >= bookingStart);
    });

    return !hasOverlap; // Returns true if available (no overlap)
  },
};
