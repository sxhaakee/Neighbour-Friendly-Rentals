# 🚀 Quick Start Guide - NFRR

Get your rental marketplace running in **15 minutes**!

## Step 1: Install Dependencies (2 min)

```bash
cd NFRR
npm install
```

## Step 2: Setup Supabase (5 min)

### A. Create Project
1. Go to https://supabase.com
2. Sign up / Login
3. Click "New Project"
4. Name it "NFRR" (or anything you like)
5. Set a strong database password
6. Wait for project to initialize (~2 min)

### B. Get Your Keys
1. Go to **Project Settings** (gear icon)
2. Click **API** in sidebar
3. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### C. Setup Database
1. Click **SQL Editor** in sidebar
2. Click **New Query**
3. Open `supabase-schema.sql` from project root
4. Copy ALL content and paste in SQL editor
5. Click **Run** (or Ctrl/Cmd + Enter)
6. Wait for success message ✅

## Step 3: Configure Environment (1 min)

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
VITE_APP_URL=http://localhost:5173
```

**Note:** Razorpay is optional for now. You can test without it.

## Step 4: Start Development Server (1 min)

```bash
npm run dev
```

Open http://localhost:5173 🎉

## Step 5: Create Your Account (2 min)

1. Click **Sign In** in header
2. Click **Sign Up** tab
3. Enter your details
4. Create account
5. You're logged in! ✅

## Step 6: Make Yourself Admin (2 min)

1. Go back to Supabase dashboard
2. Click **SQL Editor**
3. Run this query (replace with your email):

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

4. Refresh your app
5. You now see **Admin Panel** in menu! 🎉

## Step 7: Test the Platform (2 min)

### As Customer:
1. Click **Add Item** (+ button or header)
2. Fill in details and upload images
3. Submit → Status: **Pending**
4. Go to **Dashboard** → See your listing

### As Admin:
1. Click **Admin Panel** in header
2. See your pending listing
3. Click ✅ to approve
4. Go to **Browse** → Your listing is live!

### Test Booking:
1. Browse listings
2. Click **View Details**
3. Click **Book Now**
4. Select dates
5. See price calculation
6. (Skip payment for now if no Razorpay)

---

## 🎯 You're Done!

Your rental marketplace is now running with:
- ✅ User authentication
- ✅ Listing management
- ✅ Admin approval system
- ✅ Booking system
- ✅ Image uploads
- ✅ Search & filters

---

## 🔧 Optional: Setup Razorpay (5 min)

### For Test Payments:

1. Go to https://razorpay.com
2. Sign up for account
3. Go to **Settings** → **API Keys**
4. Click **Generate Test Key**
5. Copy **Key ID** (starts with `rzp_test_`)
6. Add to `.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
   ```
7. Restart dev server
8. Test booking with payment!

**Test Card Details:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

---

## 📚 Next Steps

1. **Customize branding** - Update logo, colors
2. **Add more listings** - Test the platform
3. **Invite friends** - Get feedback
4. **Deploy** - Make it live (see SETUP_GUIDE.md)
5. **Monetize** - Start earning!

---

## 🆘 Troubleshooting

### Can't login?
- Check Supabase project is active
- Verify .env file has correct keys
- Check browser console for errors

### Images not uploading?
- Check Supabase Storage bucket exists
- Verify storage policies in SQL ran successfully

### Admin panel not showing?
- Run the SQL to update your role
- Logout and login again
- Clear browser cache

### Need help?
- Check `SETUP_GUIDE.md` for detailed instructions
- Check `IMPLEMENTATION_SUMMARY.md` for features
- Review Supabase logs in dashboard

---

## 🎉 Congratulations!

You now have a fully functional rental marketplace platform!

**What you can do:**
- List items for rent
- Rent items from others
- Manage everything from dashboard
- Approve listings as admin
- Accept payments (with Razorpay)

**Ready to scale?**
- Deploy to Vercel/Netlify
- Add custom domain
- Market to your community
- Start earning! 💰

---

*Built to help you succeed! 🚀*
