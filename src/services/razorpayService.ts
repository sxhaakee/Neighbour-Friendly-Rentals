import { supabase } from '../lib/supabase';
import { emailService } from './emailService';

// Razorpay configuration - Your live key
// Razorpay configuration - Use env var if available, else fallback to live key (caution)
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_RZHNDjla2df5tS';

// Validate and log
if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_HERE') {
  console.error('❌ Razorpay key not configured');
} else {
  const isTest = RAZORPAY_KEY_ID.includes('test');
  console.log(`✅ Razorpay ${isTest ? 'TEST' : 'LIVE'} key loaded`);
}

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
  notes?: any;
  payment_capture?: number | boolean;
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
  /**
   * Load Razorpay SDK
   * According to: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
   */
  loadScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Validate key first
      if (!RAZORPAY_KEY_ID) {
        console.error('❌ Razorpay key not configured');
        resolve(false);
        return;
      }

      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      // Load Razorpay checkout script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay SDK loaded');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay SDK');
        resolve(false);
      };
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
        return { success: false, error: 'Failed to load payment gateway. Please check your internet connection.' };
      }

      // Verify Razorpay is available
      if (!window.Razorpay) {
        console.error('❌ Razorpay object not found on window');
        return { success: false, error: 'Payment gateway not initialized. Please refresh and try again.' };
      }

      // Verify key is present
      if (!RAZORPAY_KEY_ID) {
        console.error('❌ Razorpay key not configured');
        return { success: false, error: 'Payment gateway not configured. Please contact support.' };
      }

      console.log('✅ Razorpay initialized, processing payment...');

      // Calculate amount
      const amount = plan === 'monthly' ? 49 : 499;
      const amountInPaise = amount * 100; // Razorpay uses paise

      return new Promise((resolve) => {
        try {
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
            payment_capture: 1,
            notes: {
              info: "Premium Subscription",
              auto_capture: "true"
            },
            handler: async (response: RazorpayResponse) => {
              // Payment successful
              console.log('✅ Payment successful:', response.razorpay_payment_id);

              // Update user to premium
              const expiryDate = new Date();
              if (plan === 'monthly') {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
              } else {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
              }

              try {
                // Update profile with payment tracking
                await supabase
                  .from('profiles')
                  .update({
                    is_premium: true,
                    premium_expires_at: expiryDate.toISOString(),
                    premium_payment_id: response.razorpay_payment_id,
                    premium_plan: plan,
                  })
                  .eq('id', userId);

                // Track revenue with payment ID for refund tracking
                await supabase.from('revenue_tracking').insert({
                  revenue_type: 'premium',
                  amount: amount,
                  user_id: userId,
                  payment_id: response.razorpay_payment_id,
                  payment_status: 'completed',
                  description: `Premium ${plan} subscription - Payment ID: ${response.razorpay_payment_id}`,
                });

                // Restore hidden listings across all tables
                try {
                  await Promise.all([
                    supabase.from('listings').update({ status: 'approved' }).eq('owner_id', userId).eq('status', 'hidden'),
                    supabase.from('properties').update({ status: 'approved' }).eq('owner_id', userId).eq('status', 'hidden'),
                    supabase.from('service_providers').update({ status: 'approved' }).eq('owner_id', userId).eq('status', 'hidden')
                  ]);
                  console.log('✅ Restored hidden listings for user:', userId);
                } catch (restoreError) {
                  console.error('Error restoring hidden listings:', restoreError);
                }

                // Send success email
                emailService.sendPremiumPaymentSuccess({
                  email: userEmail,
                  full_name: userName,
                  expiryDate: expiryDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                }).catch(err => console.error('Error sending premium success email:', err));

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
                console.log('⚠️ Payment modal closed by user');
                resolve({
                  success: false,
                  error: 'Payment cancelled by user',
                });
              },
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } catch (error: any) {
          console.error('❌ Error creating Razorpay instance:', error);
          resolve({
            success: false,
            error: error.message || 'Failed to open payment gateway',
          });
        }
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
          payment_capture: 1,
          notes: {
            info: `Featured ${placement}`,
            auto_capture: "true"
          },
          handler: async (response: RazorpayResponse) => {
            console.log('✅ Featured listing payment successful:', response.razorpay_payment_id);

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
                  featured: true as any,
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
          payment_capture: 1,
          notes: {
            info: `Booking: ${itemTitle}`,
            auto_capture: "true"
          },
          handler: async (response: RazorpayResponse) => {
            console.log('✅ Booking payment successful:', response.razorpay_payment_id);

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
              const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
              const commissionRate = profile?.is_premium ? 0.15 : 0.20;
              const serviceFee = amount * commissionRate;
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
    _razorpayOrderId: string,
    _razorpayPaymentId: string,
    _razorpaySignature: string
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

  /**
   * Handle Razorpay Webhook Events (Refunds, Payment Failures)
   * This should be called from a backend webhook endpoint
   */
  async handleWebhookEvent(event: any) {
    try {
      const { event: eventType, payload } = event;
      
      console.log('Razorpay Webhook Event:', eventType);

      switch (eventType) {
        case 'payment.refunded':
          await this.handlePaymentRefund(payload.payment.entity);
          break;
        
        case 'payment.failed':
          await this.handlePaymentFailure(payload.payment.entity);
          break;
        
        default:
          console.log('Unhandled webhook event:', eventType);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  },

  /**
   * Handle payment refund - revoke premium access
   */
  async handlePaymentRefund(paymentData: any) {
    try {
      const paymentId = paymentData.id;
      const amountRefunded = paymentData.amount_refunded / 100; // Convert from paise

      console.log(`Processing refund for payment ${paymentId}, amount: ₹${amountRefunded}`);

      // Find user with this payment ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('premium_payment_id', paymentId)
        .single();

      if (profileError || !profile) {
        console.error('User not found for payment ID:', paymentId);
        return;
      }

      // Revoke premium access
      await supabase
        .from('profiles')
        .update({
          is_premium: false,
          premium_expires_at: null,
          premium_payment_id: null,
          premium_plan: null,
        })
        .eq('id', profile.id);

      // Update revenue tracking
      await supabase
        .from('revenue_tracking')
        .update({
          payment_status: 'refunded',
          description: `REFUNDED - Original: Premium subscription - Payment ID: ${paymentId}`,
        })
        .eq('payment_id', paymentId);

      // Create notification
      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'system',
        title: '⚠️ Premium Membership Cancelled',
        message: 'Your premium membership has been cancelled due to a payment refund. Your listings are now limited.',
        read: false,
      });

      console.log(`Premium access revoked for user ${profile.email}`);
    } catch (error) {
      console.error('Error handling refund:', error);
      throw error;
    }
  },

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(paymentData: any) {
    try {
      const paymentId = paymentData.id;
      console.log(`Payment failed: ${paymentId}`);

      // Update any pending transactions
      await supabase
        .from('revenue_tracking')
        .update({ payment_status: 'failed' })
        .eq('payment_id', paymentId);

    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  },

  /**
   * Process Property Booking Payment
   */
  async processPropertyBookingPayment(
    bookingId: string,
    amount: number,
    userId: string,
    userEmail: string,
    userName: string,
    userPhone: string,
    propertyTitle: string
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
          description: `Property Booking: ${propertyTitle}`,
          prefill: {
            name: userName,
            email: userEmail,
            contact: userPhone,
          },
          theme: {
            color: '#667eea',
          },
          payment_capture: 1,
          notes: {
            info: `Property Booking: ${propertyTitle}`,
            auto_capture: "true"
          },
          handler: async (response: RazorpayResponse) => {
            console.log('Property booking payment successful:', response);

            try {
              // Update booking payment status
              await supabase
                .from('property_bookings')
                .update({
                  payment_status: 'completed',
                  payment_id: response.razorpay_payment_id,
                  status: 'confirmed',
                })
                .eq('id', bookingId);

              // Track revenue (service fee)
              const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
              const commissionRate = profile?.is_premium ? 0.15 : 0.20;
              const serviceFee = amount * commissionRate;
              await supabase.from('revenue_tracking').insert({
                revenue_type: 'property_booking',
                amount: serviceFee,
                user_id: userId,
                booking_id: bookingId,
                payment_id: response.razorpay_payment_id,
                payment_status: 'completed',
                description: `Property booking fee - Payment ID: ${response.razorpay_payment_id}`,
              });

              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
              });
            } catch (error) {
              console.error('Error updating property booking status:', error);
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
   * Process Service Booking Payment
   */
  async processServiceBookingPayment(
    bookingId: string,
    amount: number,
    userId: string,
    userEmail: string,
    userName: string,
    userPhone: string,
    serviceTitle: string
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
          description: `Service Booking: ${serviceTitle}`,
          prefill: {
            name: userName,
            email: userEmail,
            contact: userPhone,
          },
          theme: {
            color: '#667eea',
          },
          payment_capture: 1,
          notes: {
            info: `Service Booking: ${serviceTitle}`,
            auto_capture: "true"
          },
          handler: async (response: RazorpayResponse) => {
            console.log('Service booking payment successful:', response);

            try {
              // Update booking payment status
              await supabase
                .from('service_bookings')
                .update({
                  payment_status: 'completed',
                  payment_id: response.razorpay_payment_id,
                  status: 'confirmed',
                })
                .eq('id', bookingId);

              // Track revenue (service fee)
              const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
              const commissionRate = profile?.is_premium ? 0.15 : 0.20;
              const serviceFee = amount * commissionRate;
              await supabase.from('revenue_tracking').insert({
                revenue_type: 'service_booking',
                amount: serviceFee,
                user_id: userId,
                booking_id: bookingId,
                payment_id: response.razorpay_payment_id,
                payment_status: 'completed',
                description: `Service booking fee - Payment ID: ${response.razorpay_payment_id}`,
              });

              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
              });
            } catch (error) {
              console.error('Error updating service booking status:', error);
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
   * Check if premium has expired and revoke access
   */
  async checkAndRevokeExpiredPremium(userId: string) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', userId)
        .single();

      if (!profile || !profile.is_premium) return;

      if (!profile?.premium_expires_at) return;
      const expiryDate = new Date(profile.premium_expires_at);
      const now = new Date();

      if (expiryDate < now) {
        // Premium has expired
        await supabase
          .from('profiles')
          .update({
            is_premium: false,
            premium_expires_at: null,
          })
          .eq('id', userId);

        // Create notification
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'system',
          title: '⏰ Premium Membership Expired',
          message: 'Your premium membership has expired. Renew now to continue enjoying unlimited listings!',
          link: '/premium',
          read: false,
        });

        console.log(`Premium expired for user ${userId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking premium expiry:', error);
      return false;
    }
  },
};

export default razorpayService;
