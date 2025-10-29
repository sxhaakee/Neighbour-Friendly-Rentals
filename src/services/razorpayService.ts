import { supabase } from '../lib/supabase';

// Razorpay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const razorpayService = {
  /**
   * Load Razorpay script
   */
  loadScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Process Premium Subscription Payment
   */
  async processPremiumPayment(
    userId: string,
    userEmail: string,
    userName: string,
    userPhone: string,
    plan: 'monthly' | 'yearly'
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      // Load Razorpay script
      const scriptLoaded = await this.loadScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Calculate amount
      const amount = plan === 'monthly' ? 299 : 2999;
      const amountInPaise = amount * 100; // Razorpay uses paise

      return new Promise((resolve) => {
        const options: RazorpayOptions = {
          key: RAZORPAY_KEY_ID,
          amount: amountInPaise,
          currency: 'INR',
          name: 'NeighbourFriendly Rentals',
          description: `Premium ${plan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
          prefill: {
            name: userName,
            email: userEmail,
            contact: userPhone,
          },
          theme: {
            color: '#667eea',
          },
          handler: async (response: RazorpayResponse) => {
            // Payment successful
            console.log('Payment successful:', response);

            // Update user to premium
            const expiryDate = new Date();
            if (plan === 'monthly') {
              expiryDate.setMonth(expiryDate.getMonth() + 1);
            } else {
              expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }

            try {
              // Update profile
              await supabase
                .from('profiles')
                .update({
                  is_premium: true,
                  premium_expires_at: expiryDate.toISOString(),
                })
                .eq('id', userId);

              // Track revenue
              await supabase.from('revenue_tracking').insert({
                revenue_type: 'premium',
                amount: amount,
                user_id: userId,
                description: `Premium ${plan} subscription - Payment ID: ${response.razorpay_payment_id}`,
              });

              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
              });
            } catch (error) {
              console.error('Error updating premium status:', error);
              resolve({
                success: false,
                error: 'Payment successful but failed to update account. Contact support.',
              });
            }
          },
          modal: {
            ondismiss: () => {
              resolve({
                success: false,
                error: 'Payment cancelled by user',
              });
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    } catch (error: any) {
      console.error('Razorpay error:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }
  },

  /**
   * Process Featured Listing Payment
   */
  async processFeaturedListingPayment(
    userId: string,
    listingId: string,
    userEmail: string,
    userName: string,
    userPhone: string,
    duration: 'week' | 'month',
    placement: 'category' | 'homepage' | 'premium'
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      const scriptLoaded = await this.loadScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Calculate amount based on placement
      const prices = {
        week: {
          category: 99,
          homepage: 199,
          premium: 499,
        },
        month: {
          category: 349,
          homepage: 699,
          premium: 1999,
        },
      };

      const amount = prices[duration][placement];
      const amountInPaise = amount * 100;

      return new Promise((resolve) => {
        const options: RazorpayOptions = {
          key: RAZORPAY_KEY_ID,
          amount: amountInPaise,
          currency: 'INR',
          name: 'NeighbourFriendly Rentals',
          description: `Featured Listing - ${placement} (${duration})`,
          prefill: {
            name: userName,
            email: userEmail,
            contact: userPhone,
          },
          theme: {
            color: '#667eea',
          },
          handler: async (response: RazorpayResponse) => {
            console.log('Featured listing payment successful:', response);

            try {
              // Calculate featured expiry
              const featuredUntil = new Date();
              if (duration === 'week') {
                featuredUntil.setDate(featuredUntil.getDate() + 7);
              } else {
                featuredUntil.setMonth(featuredUntil.getMonth() + 1);
              }

              // Update listing to featured
              await supabase
                .from('listings')
                .update({
                  is_featured: true,
                  featured_until: featuredUntil.toISOString(),
                  featured_placement: placement,
                })
                .eq('id', listingId);

              // Track revenue
              await supabase.from('revenue_tracking').insert({
                revenue_type: 'featured',
                amount: amount,
                user_id: userId,
                description: `Featured listing (${placement}, ${duration}) - Payment ID: ${response.razorpay_payment_id}`,
              });

              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
              });
            } catch (error) {
              console.error('Error updating featured status:', error);
              resolve({
                success: false,
                error: 'Payment successful but failed to update listing. Contact support.',
              });
            }
          },
          modal: {
            ondismiss: () => {
              resolve({
                success: false,
                error: 'Payment cancelled by user',
              });
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    } catch (error: any) {
      console.error('Razorpay error:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }
  },

  /**
   * Process Booking Payment
   */
  async processBookingPayment(
    bookingId: string,
    amount: number,
    userId: string,
    userEmail: string,
    userName: string,
    userPhone: string,
    itemTitle: string
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      const scriptLoaded = await this.loadScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const amountInPaise = amount * 100;

      return new Promise((resolve) => {
        const options: RazorpayOptions = {
          key: RAZORPAY_KEY_ID,
          amount: amountInPaise,
          currency: 'INR',
          name: 'NeighbourFriendly Rentals',
          description: `Booking: ${itemTitle}`,
          prefill: {
            name: userName,
            email: userEmail,
            contact: userPhone,
          },
          theme: {
            color: '#667eea',
          },
          handler: async (response: RazorpayResponse) => {
            console.log('Booking payment successful:', response);

            try {
              // Update booking payment status
              await supabase
                .from('bookings')
                .update({
                  payment_status: 'completed',
                  payment_id: response.razorpay_payment_id,
                  status: 'confirmed',
                })
                .eq('id', bookingId);

              // Track revenue (service fee)
              const serviceFee = amount * 0.1; // 10% service fee
              await supabase.from('revenue_tracking').insert({
                revenue_type: 'service_fee',
                amount: serviceFee,
                user_id: userId,
                booking_id: bookingId,
                description: `Service fee from booking - Payment ID: ${response.razorpay_payment_id}`,
              });

              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
              });
            } catch (error) {
              console.error('Error updating booking status:', error);
              resolve({
                success: false,
                error: 'Payment successful but failed to update booking. Contact support.',
              });
            }
          },
          modal: {
            ondismiss: () => {
              resolve({
                success: false,
                error: 'Payment cancelled by user',
              });
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    } catch (error: any) {
      console.error('Razorpay error:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }
  },

  /**
   * Verify payment signature (for server-side verification)
   */
  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<boolean> {
    try {
      // This should be done on server-side for security
      // For now, we'll trust Razorpay's callback
      // In production, implement server-side verification
      return true;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  },
};

export default razorpayService;
