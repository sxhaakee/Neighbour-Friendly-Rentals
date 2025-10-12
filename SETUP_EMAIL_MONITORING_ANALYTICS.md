# 📧 Setup Guide: Email, Monitoring & Analytics

**Complete step-by-step implementation**

---

## 1️⃣ Email Service - Resend Setup

### Step 1: Sign Up

```
1. Go to https://resend.com
2. Click "Sign Up"
3. Use your email: friendlyrentals.mlr@gmail.com
4. Verify email
5. Complete onboarding
```

### Step 2: Get API Key

```
1. Dashboard → API Keys
2. Click "Create API Key"
3. Name: "Production"
4. Copy the key (starts with re_...)
5. Save it securely!
```

### Step 3: Add to Environment Variables

```bash
# .env.local
VITE_RESEND_API_KEY=re_your_api_key_here
```

### Step 4: Install Package

```bash
npm install resend
```

### Step 5: Create Email Service

Create file: `src/services/emailService.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export const emailService = {
  /**
   * Send booking confirmation email with PDF agreement
   */
  async sendBookingConfirmation(data: {
    to: string;
    renterName: string;
    ownerName: string;
    itemTitle: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    bookingId: string;
    ownerEmail: string;
    ownerPhone: string;
  }) {
    try {
      const { data: result, error } = await resend.emails.send({
        from: 'Neighbour-Friendly Rentals <noreply@yourdomain.com>',
        to: data.to,
        cc: 'friendlyrentals.mlr@gmail.com', // Admin gets copy
        subject: `🎉 Booking Confirmed - ${data.itemTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0;
                padding: 0;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff;
              }
              .header { 
                background: linear-gradient(135deg, #2C5F2D 0%, #97BC62 100%);
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .header p {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
              }
              .content { 
                padding: 30px 20px; 
              }
              .details-box { 
                background: #f8f9fa; 
                padding: 20px; 
                margin: 20px 0; 
                border-left: 4px solid #2C5F2D;
                border-radius: 4px;
              }
              .details-box h3 {
                margin-top: 0;
                color: #2C5F2D;
              }
              .details-box p {
                margin: 8px 0;
              }
              .button { 
                display: inline-block; 
                padding: 14px 28px; 
                background: #2C5F2D; 
                color: white !important; 
                text-decoration: none; 
                border-radius: 6px; 
                margin: 20px 0;
                font-weight: bold;
              }
              .button:hover {
                background: #1e4620;
              }
              .steps {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .steps h3 {
                margin-top: 0;
                color: #856404;
              }
              .steps ol {
                margin: 10px 0;
                padding-left: 20px;
              }
              .steps li {
                margin: 8px 0;
              }
              .footer { 
                text-align: center; 
                padding: 20px; 
                background: #f8f9fa;
                color: #666; 
                font-size: 14px; 
              }
              .footer a {
                color: #2C5F2D;
                text-decoration: none;
              }
              .highlight {
                background: #fff3cd;
                padding: 2px 6px;
                border-radius: 3px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Booking Confirmed!</h1>
                <p>Your rental agreement is ready</p>
              </div>
              
              <div class="content">
                <p>Hello <strong>${data.renterName}</strong>,</p>
                <p>Great news! Your booking has been confirmed by the owner. You're all set to rent <strong>${data.itemTitle}</strong>!</p>
                
                <div class="details-box">
                  <h3>📋 Booking Details</h3>
                  <p><strong>Item:</strong> ${data.itemTitle}</p>
                  <p><strong>Rental Period:</strong> ${data.startDate} to ${data.endDate}</p>
                  <p><strong>Total Amount:</strong> <span class="highlight">₹${data.totalPrice}</span></p>
                  <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                </div>
                
                <center>
                  <a href="https://localhost:5174/dashboard" class="button">View Booking Details</a>
                </center>
                
                <div class="steps">
                  <h3>📝 Next Steps:</h3>
                  <ol>
                    <li><strong>Review Agreement:</strong> The rental agreement is attached to this email</li>
                    <li><strong>Complete Payment:</strong> Pay as per the agreed method</li>
                    <li><strong>Video Documentation:</strong> Record a clear video during item handover</li>
                    <li><strong>Contact Owner:</strong> Coordinate pickup/delivery</li>
                  </ol>
                </div>
                
                <div class="details-box">
                  <h3>👤 Owner Contact Information</h3>
                  <p><strong>Name:</strong> ${data.ownerName}</p>
                  <p><strong>Email:</strong> ${data.ownerEmail}</p>
                  <p><strong>Phone:</strong> ${data.ownerPhone}</p>
                </div>
                
                <div class="details-box" style="border-left-color: #dc3545;">
                  <h3>⚠️ Important Reminders</h3>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Security deposit will be refunded after item return</li>
                    <li>Take care of the item as if it were your own</li>
                    <li>Return on time to avoid late fees</li>
                    <li>Contact support for any issues</li>
                  </ul>
                </div>
                
                <p style="margin-top: 30px;">Happy renting! 🎊</p>
              </div>
              
              <div class="footer">
                <p>Need help? Contact us at <a href="mailto:friendlyrentals.mlr@gmail.com">friendlyrentals.mlr@gmail.com</a></p>
                <p>Phone: +91 8197424986</p>
                <p style="margin-top: 15px; font-size: 12px;">© 2025 Neighbour-Friendly Rentals. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('Email send error:', error);
        throw error;
      }

      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  },

  /**
   * Send email to owner when booking is created
   */
  async sendOwnerNotification(data: {
    to: string;
    ownerName: string;
    renterName: string;
    itemTitle: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    bookingId: string;
  }) {
    try {
      const { data: result, error } = await resend.emails.send({
        from: 'Neighbour-Friendly Rentals <noreply@yourdomain.com>',
        to: data.to,
        cc: 'friendlyrentals.mlr@gmail.com',
        subject: `🔔 New Booking Request - ${data.itemTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              /* Same styles as above */
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 New Booking Request</h1>
                <p>Someone wants to rent your item</p>
              </div>
              
              <div class="content">
                <p>Hello <strong>${data.ownerName}</strong>,</p>
                <p>You have a new booking request for your item <strong>${data.itemTitle}</strong>!</p>
                
                <div class="details-box">
                  <h3>📋 Booking Details</h3>
                  <p><strong>Renter:</strong> ${data.renterName}</p>
                  <p><strong>Item:</strong> ${data.itemTitle}</p>
                  <p><strong>Rental Period:</strong> ${data.startDate} to ${data.endDate}</p>
                  <p><strong>Amount:</strong> ₹${data.totalPrice}</p>
                  <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                </div>
                
                <center>
                  <a href="https://localhost:5174/admin/bookings" class="button">Review Booking</a>
                </center>
                
                <div class="steps">
                  <h3>📝 Next Steps:</h3>
                  <ol>
                    <li>Review the booking details</li>
                    <li>Approve or reject the request</li>
                    <li>If approved, coordinate with the renter</li>
                    <li>Record video during handover</li>
                  </ol>
                </div>
              </div>
              
              <div class="footer">
                <p>Need help? Contact us at <a href="mailto:friendlyrentals.mlr@gmail.com">friendlyrentals.mlr@gmail.com</a></p>
                <p>© 2025 Neighbour-Friendly Rentals. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Failed to send owner notification:', error);
      throw error;
    }
  },
};
```

### Step 6: Integrate with Booking Service

Update `src/services/bookingService.ts`:

```typescript
import { emailService } from './emailService';

// In confirmBooking function:
async confirmBooking(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      status: 'confirmed',
      approved_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      listings:listing_id (title),
      renter:renter_id (full_name, email),
      owner:owner_id (full_name, email, phone)
    `)
    .single();

  if (error) throw error;

  // Send confirmation email
  await emailService.sendBookingConfirmation({
    to: data.renter.email,
    renterName: data.renter.full_name,
    ownerName: data.owner.full_name,
    itemTitle: data.listings.title,
    startDate: data.start_date,
    endDate: data.end_date,
    totalPrice: data.total_price,
    bookingId: data.id,
    ownerEmail: data.owner.email,
    ownerPhone: data.owner.phone,
  });

  return data;
}
```

### Step 7: Test Email

```typescript
// Create a test file: src/test-email.ts
import { emailService } from './services/emailService';

emailService.sendBookingConfirmation({
  to: 'your-email@gmail.com',
  renterName: 'Test User',
  ownerName: 'Test Owner',
  itemTitle: 'Test Camera',
  startDate: '2025-10-15',
  endDate: '2025-10-20',
  totalPrice: 500,
  bookingId: 'test-123',
  ownerEmail: 'owner@test.com',
  ownerPhone: '+91 9876543210',
});
```

### Step 8: Domain Verification (Later)

**When you have a domain:**
```
1. Resend Dashboard → Domains
2. Add your domain (e.g., friendlyrentals.in)
3. Add DNS records to your domain registrar:
   - TXT: v=spf1 include:resend.com ~all
   - CNAME: resend._domainkey
   - TXT: _dmarc
4. Verify domain
5. Update from address: noreply@friendlyrentals.in
```

---

## 2️⃣ Error Tracking - Sentry Setup

### Step 1: Sign Up

```
1. Go to https://sentry.io
2. Click "Get Started"
3. Sign up with GitHub or email
4. Create organization: "Neighbour-Friendly Rentals"
```

### Step 2: Create Project

```
1. Click "Create Project"
2. Select platform: "React"
3. Project name: "nfrr-frontend"
4. Copy the DSN (looks like: https://xxx@xxx.ingest.sentry.io/xxx)
```

### Step 3: Install Package

```bash
npm install @sentry/react
```

### Step 4: Add to Environment

```bash
# .env.local
VITE_SENTRY_DSN=https://your-dsn-here
```

### Step 5: Initialize Sentry

Update `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE, // 'development' or 'production'
  integrations: [
    new Sentry.BrowserTracing({
      // Set tracesSampleRate to 1.0 to capture 100% of transactions
      tracePropagationTargets: ['localhost', /^https:\/\/yourapp\.com/],
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 6: Add Error Boundary

Create `src/components/ErrorBoundary.tsx`:

```typescript
import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle } from 'lucide-react';

const ErrorFallback = ({ error, resetError }: any) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We've been notified and are working on a fix.
        </p>
        <button
          onClick={resetError}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    fallback: ErrorFallback,
    showDialog: false,
  }
);
```

### Step 7: Wrap App with Error Boundary

Update `src/App.tsx`:

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      {/* Your existing app code */}
    </ErrorBoundary>
  );
}
```

### Step 8: Test Error Tracking

```typescript
// Add a test button somewhere
<button onClick={() => {
  throw new Error('Test Sentry error');
}}>
  Test Error
</button>

// Or manually capture
import * as Sentry from '@sentry/react';

try {
  // some code
} catch (error) {
  Sentry.captureException(error);
}
```

---

## 3️⃣ Analytics - Google Analytics 4

### Step 1: Create GA4 Property

```
1. Go to https://analytics.google.com
2. Click "Admin" (bottom left)
3. Click "Create Property"
4. Property name: "Neighbour-Friendly Rentals"
5. Select timezone: India
6. Select currency: INR
7. Click "Next"
8. Fill business details
9. Click "Create"
10. Accept terms
```

### Step 2: Set Up Data Stream

```
1. Click "Web" under Data Streams
2. Website URL: https://localhost:5174 (change later)
3. Stream name: "NFRR Web"
4. Click "Create stream"
5. Copy "Measurement ID" (starts with G-)
```

### Step 3: Install Package

```bash
npm install react-ga4
```

### Step 4: Add to Environment

```bash
# .env.local
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 5: Initialize GA4

Create `src/services/analyticsService.ts`:

```typescript
import ReactGA from 'react-ga4';

export const analyticsService = {
  initialize() {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    if (measurementId && import.meta.env.PROD) {
      ReactGA.initialize(measurementId, {
        gaOptions: {
          send_page_view: false, // We'll send manually
        },
      });
      console.log('Google Analytics initialized');
    }
  },

  // Track page views
  pageView(path: string, title?: string) {
    ReactGA.send({ 
      hitType: 'pageview', 
      page: path,
      title: title || document.title,
    });
  },

  // Track events
  event(category: string, action: string, label?: string, value?: number) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  },

  // Custom events
  trackBookingCreated(bookingId: string, amount: number) {
    this.event('Booking', 'Created', bookingId, amount);
  },

  trackBookingConfirmed(bookingId: string) {
    this.event('Booking', 'Confirmed', bookingId);
  },

  trackListingViewed(listingId: string, title: string) {
    this.event('Listing', 'Viewed', title);
  },

  trackSignup(method: string) {
    this.event('User', 'Signup', method);
  },

  trackLogin(method: string) {
    this.event('User', 'Login', method);
  },

  trackSearch(query: string) {
    this.event('Search', 'Query', query);
  },
};
```

### Step 6: Initialize in App

Update `src/main.tsx`:

```typescript
import { analyticsService } from './services/analyticsService';

// Initialize analytics
analyticsService.initialize();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 7: Track Page Views

Update `src/App.tsx`:

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from './services/analyticsService';

function App() {
  const location = useLocation();

  useEffect(() => {
    analyticsService.pageView(location.pathname);
  }, [location]);

  return (
    // Your app
  );
}
```

### Step 8: Track Events

Add tracking to key actions:

```typescript
// In BookItem.tsx - when booking is created
const handleBooking = async () => {
  // ... booking logic
  analyticsService.trackBookingCreated(booking.id, booking.total_price);
};

// In Auth.tsx - when user signs up
const handleSignup = async () => {
  // ... signup logic
  analyticsService.trackSignup('email');
};

// In ListingCard.tsx - when listing is clicked
const handleClick = () => {
  analyticsService.trackListingViewed(listing.id, listing.title);
  navigate(`/listing/${listing.id}`);
};
```

---

## 4️⃣ Uptime Monitoring - UptimeRobot

### Step 1: Sign Up

```
1. Go to https://uptimerobot.com
2. Click "Free Sign Up"
3. Enter email: friendlyrentals.mlr@gmail.com
4. Verify email
5. Login
```

### Step 2: Add Monitor

```
1. Click "Add New Monitor"
2. Monitor Type: HTTP(s)
3. Friendly Name: "NFRR Frontend"
4. URL: https://localhost:5174 (change after deployment)
5. Monitoring Interval: 5 minutes
6. Click "Create Monitor"
```

### Step 3: Set Up Alerts

```
1. Click on your monitor
2. Click "Alert Contacts"
3. Add email: friendlyrentals.mlr@gmail.com
4. Add SMS (optional): +91 8197424986
5. Save
```

### Step 4: Add More Monitors (After Deployment)

```
- Frontend: https://yoursite.com
- API Health: https://yoursite.com/api/health
- Supabase: Check in Supabase dashboard
```

---

## 5️⃣ Testing Everything

### Test Email

```bash
# Run in browser console
emailService.sendBookingConfirmation({
  to: 'your-email@gmail.com',
  // ... test data
});

# Check:
# 1. Email received?
# 2. Formatting correct?
# 3. Links work?
# 4. Admin CC received?
```

### Test Sentry

```bash
# Click test error button
# Check Sentry dashboard:
# 1. Error appears?
# 2. Stack trace visible?
# 3. User context captured?
```

### Test Analytics

```bash
# Navigate around the app
# Check GA4 Realtime report:
# 1. Page views tracked?
# 2. Events firing?
# 3. User count correct?
```

### Test Uptime

```bash
# Wait 5 minutes
# Check UptimeRobot dashboard:
# 1. Monitor shows "Up"?
# 2. Response time logged?
```

---

## 6️⃣ Environment Variables Summary

```bash
# .env.local (Development)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_RESEND_API_KEY=re_your_key
VITE_SENTRY_DSN=https://your_sentry_dsn
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Production (Vercel Dashboard)
# Same variables but with production values
```

---

## 7️⃣ Deployment Checklist

- [ ] Install all packages
- [ ] Set up Resend account
- [ ] Set up Sentry project
- [ ] Set up GA4 property
- [ ] Set up UptimeRobot
- [ ] Add all environment variables
- [ ] Test email sending
- [ ] Test error tracking
- [ ] Test analytics
- [ ] Deploy to Vercel
- [ ] Update URLs in services
- [ ] Test in production

---

## 🎉 You're Done!

**What you now have:**
- ✅ Professional email system
- ✅ Error tracking & monitoring
- ✅ User analytics
- ✅ Uptime monitoring

**Total Cost:** ₹0/month (all free tiers)

**Next:** Deploy to production and start tracking real users!
