# 🚀 Quick Start: Email, Monitoring & Analytics

**Get everything running in 30 minutes**

---

## Step 1: Install Packages (2 minutes)

```bash
cd /Users/mohammedshakeeb/Desktop/NFRR
npm install resend @sentry/react react-ga4
```

---

## Step 2: Sign Up for Services (10 minutes)

### A. Resend (Email)
1. Go to https://resend.com
2. Sign up with `friendlyrentals.mlr@gmail.com`
3. Get API key from dashboard
4. **Copy the key** (starts with `re_`)

### B. Sentry (Error Tracking)
1. Go to https://sentry.io
2. Sign up (use GitHub or email)
3. Create project: "React"
4. **Copy the DSN** (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)

### C. Google Analytics
1. Go to https://analytics.google.com
2. Create property: "Neighbour-Friendly Rentals"
3. Create web stream
4. **Copy Measurement ID** (starts with `G-`)

### D. UptimeRobot (Optional)
1. Go to https://uptimerobot.com
2. Sign up
3. Add monitor after deployment

---

## Step 3: Add Environment Variables (2 minutes)

Create/update `.env.local`:

```bash
# Existing
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_RAZORPAY_KEY_ID=your_key

# New - Add these
VITE_RESEND_API_KEY=re_your_key_here
VITE_SENTRY_DSN=https://your_sentry_dsn
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Step 4: Update Email Service (5 minutes)

Replace the TODO in `src/services/emailService.ts`:

```typescript
// Line 213-225, replace with:
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

const response = await resend.emails.send({
  from: 'NFRR <noreply@yourdomain.com>', // Change after domain setup
  to: bookingData.email,
  cc: 'friendlyrentals.mlr@gmail.com', // Admin gets copy
  ...EMAIL_TEMPLATES.bookingConfirmation(bookingData),
});

return { success: true, data: response };
```

---

## Step 5: Initialize Sentry (3 minutes)

Update `src/main.tsx` - add at the top:

```typescript
import * as Sentry from '@sentry/react';

// Initialize Sentry BEFORE ReactDOM.render
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Then your existing code...
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Step 6: Initialize Analytics (3 minutes)

Create `src/services/analyticsService.ts`:

```typescript
import ReactGA from 'react-ga4';

export const analyticsService = {
  initialize() {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId && import.meta.env.PROD) {
      ReactGA.initialize(measurementId);
    }
  },

  pageView(path: string) {
    ReactGA.send({ hitType: 'pageview', page: path });
  },

  event(category: string, action: string, label?: string) {
    ReactGA.event({ category, action, label });
  },
};
```

Then in `src/main.tsx`:

```typescript
import { analyticsService } from './services/analyticsService';

analyticsService.initialize();

// ... rest of code
```

---

## Step 7: Track Page Views (2 minutes)

In `src/App.tsx`:

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from './services/analyticsService';

function App() {
  const location = useLocation();

  useEffect(() => {
    analyticsService.pageView(location.pathname);
  }, [location]);

  // ... rest of your app
}
```

---

## Step 8: Test Everything (3 minutes)

```bash
# Start dev server
npm run dev

# Test in browser:
# 1. Navigate around - check GA4 Realtime
# 2. Trigger an error - check Sentry
# 3. Create a booking - check email logs
```

---

## ✅ Verification Checklist

- [ ] Packages installed
- [ ] All 3 services signed up
- [ ] Environment variables added
- [ ] Email service updated
- [ ] Sentry initialized
- [ ] Analytics initialized
- [ ] Page tracking added
- [ ] Tested in browser

---

## 🎯 What You Get

### Email (Resend)
- Professional booking confirmations
- ID verification emails
- Admin CC on all emails
- **Free:** 3,000 emails/month

### Error Tracking (Sentry)
- Real-time error alerts
- Stack traces
- User context
- **Free:** 5,000 errors/month

### Analytics (GA4)
- Page views
- User behavior
- Conversion tracking
- **Free:** Unlimited

---

## 🚀 Next Steps

1. **Deploy to production** (Vercel)
2. **Set up custom domain**
3. **Update email "from" address**
4. **Add UptimeRobot monitor**
5. **Test with real users**

---

## 📚 Full Documentation

- **Detailed guide:** `SETUP_EMAIL_MONITORING_ANALYTICS.md`
- **Deployment:** `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Strategy:** `CO_FOUNDER_RECOMMENDATIONS.md`

---

**Total Time:** ~30 minutes  
**Total Cost:** ₹0/month (all free tiers)

**You're ready to launch! 🎉**
