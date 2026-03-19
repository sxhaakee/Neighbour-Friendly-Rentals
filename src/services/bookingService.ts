import { supabase } from '../lib/supabase';

export interface Booking {
  id: string;
  listing_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | string | null;
  payment_status: string | null;
  payment_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  renter_name: string;
  renter_email: string;
  renter_phone: string | null;
  renter_address: string | null;
  platform_commission: number | null;
  item_price: number | null;
  delivery_charge: number | null;
  security_deposit: number | null;
  payment_method: string | null;
  rejection_reason: string | null;
  confirmed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  // UI only / legacy fields
  start_time?: string;
  end_time?: string;
  notes?: string;
  special_requests?: string;
  property_id?: string;
  service_id?: string;
}

export interface BookingInsert {
  id?: string;
  listing_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_price: number;
  status?: string | null;
  payment_status?: string | null;
  payment_id?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  renter_name: string;
  renter_email: string;
  renter_phone?: string | null;
  renter_address?: string | null;
  platform_commission?: number | null;
  item_price?: number | null;
  delivery_charge?: number | null;
  security_deposit?: number | null;
  payment_method?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  confirmed_at?: string | null;
  // UI only / legacy fields
  start_time?: string;
  end_time?: string;
  notes?: string;
  special_requests?: string;
  property_id?: string;
  service_id?: string;
}

export const bookingService = {
  // Create booking
  async createBooking(booking: BookingInsert) {
    console.log('Creating booking with data:', booking);
    
    // Sanitize booking data to remove fields not in the database table
    const { 
      start_time, end_time, notes, special_requests, property_id, service_id,
      ...cleanBooking 
    } = booking as any;

    const { data, error } = await supabase
      .from('bookings')
      .insert([cleanBooking])
      .select('*')
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

    // Send witty notification
    import('../utils/notificationUtils').then(({ sendWittyEventNotification }) => {
      sendWittyEventNotification('booking');
    });

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
          owner_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update booking
  async updateBooking(id: string, updates: Partial<Booking>) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select('id, status, updated_at')
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
    const updates: any = {
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

  // Update booking status (generic method)
  async updateBookingStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
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
      .select('id, start_date, end_date, status')
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
