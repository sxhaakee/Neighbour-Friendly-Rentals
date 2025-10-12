# 💳 Razorpay Integration Guide

## 🎯 Complete Implementation Guide

**Last Updated:** October 12, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Razorpay Account Setup](#razorpay-account-setup)
4. [Installation](#installation)
5. [Frontend Integration](#frontend-integration)
6. [Backend Integration](#backend-integration)
7. [Payment Flow](#payment-flow)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)
10. [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

### What We'll Build:
- ✅ Secure payment gateway integration
- ✅ Payment on booking confirmation
- ✅ Automatic order creation
- ✅ Payment verification
- ✅ Refund handling
- ✅ Webhook integration

### Payment Flow:
```
User Books Item → Razorpay Payment → Verify Payment → Confirm Booking → Notify Owner/Admin
```

---

## 📦 Prerequisites

### Required:
- Razorpay Account (Free to create)
- API Keys (Test & Live)
- Bank Account (for settlements)
- GST Number (optional but recommended)

### Tech Stack:
- React (Frontend)
- Supabase (Backend)
- Razorpay SDK

---

## 🔑 Razorpay Account Setup

### Step 1: Create Account
1. Go to https://razorpay.com/
2. Click "Sign Up"
3. Fill in business details
4. Verify email and phone

### Step 2: Get API Keys
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Generate **Test Mode** keys first
4. Copy:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (keep this secret!)

### Step 3: Configure Webhook
1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/razorpay-webhook`
3. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
4. Copy **Webhook Secret**

---

## 📥 Installation

### Install Razorpay SDK:
```bash
npm install razorpay
```

### Install Types (TypeScript):
```bash
npm install --save-dev @types/razorpay
```

### Add to Environment Variables:
```env
# .env file
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

---

## 💻 Frontend Integration

### 1. Create Razorpay Service

Create file: `src/services/razorpayService.ts`

```typescript
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  amount: number; // in paise (₹100 = 10000 paise)
  currency: string;
  orderId: string;
  bookingId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
}

export const razorpayService = {
  /**
   * Load Razorpay script
   */
  loadScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Create Razorpay order
   */
  createOrder: async (amount: number, bookingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount, bookingId },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Open Razorpay checkout
   */
  openCheckout: async (options: RazorpayOptions, onSuccess: (response: any) => void, onFailure: (error: any) => void) => {
    const scriptLoaded = await razorpayService.loadScript();
    
    if (!scriptLoaded) {
      onFailure(new Error('Razorpay SDK failed to load'));
      return;
    }

    const razorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: options.currency,
      name: 'Neighbour Friendly Rentals',
      description: 'Rental Booking Payment',
      image: '/logo.png', // Your logo
      order_id: options.orderId,
      handler: async function (response: any) {
        // Payment successful
        try {
          // Verify payment on backend
          const verified = await razorpayService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: options.bookingId,
          });

          if (verified) {
            onSuccess(response);
          } else {
            onFailure(new Error('Payment verification failed'));
          }
        } catch (error) {
          onFailure(error);
        }
      },
      prefill: {
        name: options.userName,
        email: options.userEmail,
        contact: options.userPhone,
      },
      notes: {
        booking_id: options.bookingId,
      },
      theme: {
        color: '#14b8a6', // Your brand color
      },
      modal: {
        ondismiss: function () {
          onFailure(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  },

  /**
   * Verify payment
   */
  verifyPayment: async (paymentData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: paymentData,
      });

      if (error) throw error;
      return data.verified;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  },

  /**
   * Initiate refund
   */
  initiateRefund: async (paymentId: string, amount: number, reason: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-refund', {
        body: { paymentId, amount, reason },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error initiating refund:', error);
      throw error;
    }
  },
};
```

### 2. Update BookItem Component

Update `src/pages/BookItem.tsx`:

```typescript
import { razorpayService } from '../services/razorpayService';

// Add state for payment
const [paymentProcessing, setPaymentProcessing] = useState(false);

// Update handleConfirmBooking function
const handleConfirmBooking = async () => {
  if (!agreedToTerms) {
    showToast.error('Please agree to the rental agreement');
    return;
  }

  try {
    setProcessing(true);
    setPaymentProcessing(true);

    const typedListing = listing as any;
    const profile = await getProfile();

    // Create booking first
    const booking = await bookingService.createBooking({
      listing_id: typedListing.id,
      renter_id: user.id,
      renter_name: profile.full_name || profile.email,
      renter_email: profile.email,
      owner_id: typedListing.owner_id,
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      total_price: Math.round(grandTotal),
      item_price: itemPrice,
      platform_commission: serviceCharge,
      service_charge: 0,
      delivery_charge: deliveryCharge,
      gst_amount: 0,
      security_deposit: securityDeposit,
      delivery_opted: deliveryOpted,
      pickup_opted: deliveryOpted,
      payment_method: 'razorpay',
      status: 'pending',
      payment_status: 'pending',
    } as any);

    // Create Razorpay order
    const order = await razorpayService.createOrder(
      Math.round(grandTotal * 100), // Convert to paise
      booking.id
    );

    // Open Razorpay checkout
    await razorpayService.openCheckout(
      {
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        orderId: order.id,
        bookingId: booking.id,
        userEmail: profile.email,
        userName: profile.full_name || profile.email,
        userPhone: renterPhone,
      },
      async (response) => {
        // Payment successful
        showToast.success('Payment successful! Booking confirmed.');
        setPaymentProcessing(false);
        setShowAgreement(false);
        
        // Navigate to dashboard after delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      },
      (error) => {
        // Payment failed
        console.error('Payment failed:', error);
        showToast.error('Payment failed. Please try again.');
        setPaymentProcessing(false);
      }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    showToast.error('Failed to create booking');
    setPaymentProcessing(false);
  } finally {
    setProcessing(false);
  }
};
```

---

## 🔧 Backend Integration (Supabase Edge Functions)

### 1. Create Order Function

Create file: `supabase/functions/create-razorpay-order/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Razorpay from 'https://esm.sh/razorpay@2.9.2';

const razorpay = new Razorpay({
  key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
  key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
});

serve(async (req) => {
  try {
    const { amount, bookingId } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount, // in paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        booking_id: bookingId,
      },
    });

    return new Response(JSON.stringify(order), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### 2. Verify Payment Function

Create file: `supabase/functions/verify-razorpay-payment/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

serve(async (req) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json();

    // Verify signature
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    
    const expectedSignature = createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const verified = expectedSignature === razorpay_signature;

    if (verified) {
      // Update booking status
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          razorpay_order_id,
          razorpay_payment_id,
          paid_at: new Date().toISOString(),
        })
        .eq('id', bookingId);
    }

    return new Response(JSON.stringify({ verified }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### 3. Refund Function

Create file: `supabase/functions/create-razorpay-refund/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Razorpay from 'https://esm.sh/razorpay@2.9.2';

const razorpay = new Razorpay({
  key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
  key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
});

serve(async (req) => {
  try {
    const { paymentId, amount, reason } = await req.json();

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount, // in paise
      notes: {
        reason: reason,
      },
    });

    return new Response(JSON.stringify(refund), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

---

## 🔄 Payment Flow Diagram

```
┌─────────────┐
│   User      │
│  Books Item │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Create Booking  │
│ (Status: Pending)│
└──────┬──────────┘
       │
       ▼
┌──────────────────┐
│ Create Razorpay  │
│     Order        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Open Razorpay    │
│   Checkout       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ User Pays        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Verify Payment   │
│  (Backend)       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Update Booking   │
│ (Status: Confirmed)│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Notify Owner     │
│  & Admin         │
└──────────────────┘
```

---

## 🧪 Testing

### Test Mode:
1. Use test API keys (rzp_test_...)
2. Test card numbers:
   - **Success:** 4111 1111 1111 1111
   - **Failure:** 4000 0000 0000 0002
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date

### Test UPI:
- **Success:** success@razorpay
- **Failure:** failure@razorpay

### Test Scenarios:
- [ ] Successful payment
- [ ] Failed payment
- [ ] Payment cancellation
- [ ] Network timeout
- [ ] Refund processing

---

## 🚀 Production Deployment

### Step 1: Activate Live Mode
1. Complete KYC in Razorpay Dashboard
2. Add bank account details
3. Generate **Live API Keys**
4. Update environment variables

### Step 2: Update Environment
```env
# Production .env
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET
```

### Step 3: Configure Webhook
- Update webhook URL to production domain
- Test webhook with live events

### Step 4: Enable Payment Methods
- Cards (Visa, Mastercard, Rupay)
- UPI
- Net Banking
- Wallets (Paytm, PhonePe, etc.)

---

## 🔒 Security Best Practices

### DO:
- ✅ Always verify payment on backend
- ✅ Use HTTPS for all requests
- ✅ Store API secrets securely
- ✅ Implement rate limiting
- ✅ Log all transactions
- ✅ Handle webhooks properly

### DON'T:
- ❌ Expose API secret in frontend
- ❌ Trust client-side payment status
- ❌ Skip signature verification
- ❌ Store card details
- ❌ Hardcode API keys

---

## 💰 Pricing & Fees

### Razorpay Charges:
- **Domestic Cards:** 2% per transaction
- **International Cards:** 3% per transaction
- **UPI:** 0% (free)
- **Net Banking:** 2% per transaction
- **Wallets:** 2% per transaction

### Settlement:
- **T+3 days** (3 working days)
- Instant settlements available (extra charges)

---

## 📊 Monitoring & Analytics

### Razorpay Dashboard:
- View all transactions
- Track success rate
- Monitor refunds
- Download reports
- Analyze payment methods

### Custom Analytics:
```typescript
// Track in your analytics
logEvent('payment_initiated', { amount, bookingId });
logEvent('payment_success', { amount, paymentId });
logEvent('payment_failed', { amount, error });
```

---

## 🆘 Troubleshooting

### Payment Not Working:
1. Check API keys are correct
2. Verify script is loaded
3. Check browser console for errors
4. Test with test cards first

### Webhook Not Receiving:
1. Verify webhook URL is accessible
2. Check webhook secret
3. Test with Razorpay webhook tester
4. Check server logs

### Refund Failed:
1. Verify payment is captured
2. Check refund amount
3. Ensure sufficient balance
4. Contact Razorpay support

---

## 📞 Support

### Razorpay Support:
- Email: support@razorpay.com
- Phone: +91-80-6861-8144
- Docs: https://razorpay.com/docs/

### Integration Help:
- Razorpay Discord
- Stack Overflow
- GitHub Issues

---

## ✅ Implementation Checklist

### Setup:
- [ ] Create Razorpay account
- [ ] Get API keys
- [ ] Install SDK
- [ ] Configure environment variables

### Frontend:
- [ ] Create razorpayService.ts
- [ ] Update BookItem.tsx
- [ ] Add payment UI
- [ ] Handle success/failure

### Backend:
- [ ] Create order function
- [ ] Create verify function
- [ ] Create refund function
- [ ] Setup webhook handler

### Testing:
- [ ] Test with test cards
- [ ] Test UPI
- [ ] Test failures
- [ ] Test refunds

### Production:
- [ ] Complete KYC
- [ ] Switch to live keys
- [ ] Update webhook
- [ ] Monitor transactions

---

**Status:** 📋 **READY TO IMPLEMENT**  
**Estimated Time:** 4-6 hours  
**Difficulty:** Medium

**Next Step:** Start with Razorpay account creation and get your test API keys!
