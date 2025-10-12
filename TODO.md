# 📋 TODO - Manual Setup Required

This file lists everything you need to do manually to get the platform running. Check off items as you complete them!

---

## 🔴 CRITICAL - Must Do Before Running

### [ ] 1. Supabase Setup (10 minutes)

**Why:** The entire backend depends on this

**Steps:**
1. [ ] Create Supabase account at https://supabase.com
2. [ ] Create new project (wait ~2 min for initialization)
3. [ ] Copy Project URL from Settings → API
4. [ ] Copy anon/public key from Settings → API
5. [ ] Go to SQL Editor
6. [ ] Copy entire content of `supabase-schema.sql`
7. [ ] Paste and run in SQL Editor
8. [ ] Verify all queries executed successfully
9. [ ] Check Storage → should see `listing-images` bucket

**Result:** Database tables, policies, and storage ready ✅

---

### [ ] 2. Environment Variables (2 minutes)

**Why:** App needs these to connect to Supabase

**Steps:**
1. [ ] Create `.env` file in project root
2. [ ] Copy content from `.env.example`
3. [ ] Replace with your actual Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
4. [ ] Save file

**Result:** App can connect to your Supabase project ✅

---

### [ ] 3. Install Dependencies (2 minutes)

**Why:** Need all packages to run the app

**Steps:**
```bash
npm install
```

**Result:** All packages installed ✅

---

### [ ] 4. Start Development Server (1 minute)

**Why:** To see your app running

**Steps:**
```bash
npm run dev
```

**Result:** App running at http://localhost:5173 ✅

---

## 🟡 IMPORTANT - Do This Next

### [ ] 5. Create Your Account (2 minutes)

**Steps:**
1. [ ] Open http://localhost:5173
2. [ ] Click "Sign In" in header
3. [ ] Switch to "Sign Up" tab
4. [ ] Enter your details
5. [ ] Click "Create Account"
6. [ ] You should be logged in

**Result:** You have a customer account ✅

---

### [ ] 6. Make Yourself Admin (2 minutes)

**Why:** To access admin dashboard and approve listings

**Steps:**
1. [ ] Go to Supabase dashboard
2. [ ] Click SQL Editor
3. [ ] Run this query (replace email):
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```
4. [ ] Refresh your app
5. [ ] Check header - should see "Admin Panel"

**Result:** You are now an admin ✅

---

## 🟢 OPTIONAL - For Full Functionality

### [ ] 7. Razorpay Setup (5 minutes)

**Why:** To accept real payments

**When:** Can skip for testing, but needed for production

**Steps:**
1. [ ] Go to https://razorpay.com
2. [ ] Sign up for account
3. [ ] Complete verification (may take 1-2 days)
4. [ ] Go to Settings → API Keys
5. [ ] Generate Test Key (for development)
6. [ ] Copy Key ID (starts with `rzp_test_`)
7. [ ] Add to `.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key
   ```
8. [ ] Restart dev server

**Test Cards:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Result:** Payment system working ✅

---

### [ ] 8. Backend API for Payment Verification (Optional but Recommended)

**Why:** Frontend-only payment verification is insecure

**When:** Before going to production

**What:** Create a Node.js/Express backend

**See:** `SETUP_GUIDE.md` section "Backend API Requirements" for code examples

**Result:** Secure payment verification ✅

---

## 🎯 TESTING - Verify Everything Works

### [ ] 9. Test Customer Flow

1. [ ] Create a listing
   - Click "Add Item" or + button
   - Fill details and upload images
   - Submit
   - Should show "Pending" status

2. [ ] Check Dashboard
   - Go to Dashboard
   - See your listing under "My Listings"
   - Status should be "pending"

3. [ ] Browse Listings
   - Go to Browse
   - Your listing should NOT appear (not approved yet)

**Result:** Customer flow working ✅

---

### [ ] 10. Test Admin Flow

1. [ ] Access Admin Panel
   - Click "Admin Panel" in header
   - Should see admin dashboard

2. [ ] Approve Listing
   - See your pending listing
   - Click ✅ approve button
   - Status changes to "approved"

3. [ ] Verify Approval
   - Go to Browse
   - Your listing should now appear
   - Click to view details

**Result:** Admin flow working ✅

---

### [ ] 11. Test Booking Flow

1. [ ] Book an Item
   - Browse listings
   - Click on a listing
   - Click "Book Now"
   - Select start and end dates
   - See price calculation

2. [ ] Test Payment (if Razorpay setup)
   - Click "Proceed to Payment"
   - Razorpay modal should open
   - Use test card details
   - Complete payment

3. [ ] Check Dashboard
   - Go to Dashboard → My Bookings
   - See your booking
   - Status should be "confirmed"

**Result:** Booking flow working ✅

---

## 🚀 DEPLOYMENT - When Ready to Go Live

### [ ] 12. Deploy Frontend

**Option A: Vercel (Recommended)**
1. [ ] Push code to GitHub
2. [ ] Go to https://vercel.com
3. [ ] Import your repository
4. [ ] Add environment variables
5. [ ] Deploy

**Option B: Netlify**
1. [ ] Build: `npm run build`
2. [ ] Upload `dist` folder to Netlify
3. [ ] Add environment variables

**Result:** App is live! ✅

---

### [ ] 13. Production Checklist

1. [ ] Update Supabase to production mode
2. [ ] Switch Razorpay to live keys
3. [ ] Add custom domain
4. [ ] Setup SSL certificate (auto with Vercel/Netlify)
5. [ ] Test all flows on production
6. [ ] Create backend API for payment verification
7. [ ] Setup email notifications (optional)
8. [ ] Add analytics (Google Analytics, etc.)
9. [ ] Create terms of service and privacy policy
10. [ ] Setup customer support system

**Result:** Production ready! ✅

---

## 📊 Progress Tracker

**Backend Setup:**
- [ ] Supabase account created
- [ ] Database schema deployed
- [ ] Storage bucket configured
- [ ] Environment variables set

**Authentication:**
- [ ] Customer account created
- [ ] Admin role assigned
- [ ] Login/logout working

**Core Features:**
- [ ] Listing creation working
- [ ] Image upload working
- [ ] Admin approval working
- [ ] Browse/search working
- [ ] Booking system working

**Payments:**
- [ ] Razorpay account created
- [ ] Test payments working
- [ ] Backend verification (optional)

**Deployment:**
- [ ] Frontend deployed
- [ ] Custom domain (optional)
- [ ] Production mode enabled

---

## 🎉 When Everything is Checked

Congratulations! Your rental marketplace is:
- ✅ Fully functional
- ✅ Secure and scalable
- ✅ Ready to accept users
- ✅ Ready to generate revenue

**Next Steps:**
1. Market to your target audience
2. Onboard first users
3. Gather feedback
4. Iterate and improve
5. Scale and grow!

---

## 🆘 If You Get Stuck

1. **Check** `QUICK_START.md` for step-by-step guide
2. **Read** `SETUP_GUIDE.md` for detailed instructions
3. **Review** `IMPLEMENTATION_SUMMARY.md` for features
4. **Check** Supabase logs in dashboard
5. **Check** browser console for errors
6. **Verify** .env file has correct values

---

## 📞 Common Issues

### "Cannot connect to Supabase"
- [ ] Check .env file exists
- [ ] Verify VITE_SUPABASE_URL is correct
- [ ] Verify VITE_SUPABASE_ANON_KEY is correct
- [ ] Restart dev server after changing .env

### "Images not uploading"
- [ ] Check storage bucket exists in Supabase
- [ ] Verify storage policies were created (check SQL)
- [ ] Check file size (max 50MB)

### "Admin panel not showing"
- [ ] Verify SQL query to update role ran successfully
- [ ] Logout and login again
- [ ] Check browser console for errors

### "Payment not working"
- [ ] Verify VITE_RAZORPAY_KEY_ID is set
- [ ] Check Razorpay dashboard for errors
- [ ] Use test card details for test mode

---

*Keep this file updated as you complete tasks! ✅*
