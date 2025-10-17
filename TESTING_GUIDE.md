# 🧪 COMPLETE TESTING GUIDE - All 3 Phases

## 🚀 **FIRST: Setup Database**

### Run this in Supabase SQL Editor:
```sql
-- File: COMPLETE_DATABASE_SETUP.sql
-- Copy and paste the entire file
```

**Wait for success message:**
```
✅ COMPLETE DATABASE SETUP SUCCESSFUL!
🎉 Database is ready to use!
```

---

## 📋 **PHASE 1: Core Features Testing**

### **1. Reviews & Ratings System** ⭐

#### Where to Test:
1. Go to any listing page: `/listings/[listing-id]`
2. Scroll to "Reviews" section

#### What to Test:
- ✅ **Add Review**: Click "Write a Review" button
  - Rate 1-5 stars
  - Add comment
  - Upload photos (optional)
  - Submit review
- ✅ **View Reviews**: See all reviews for the listing
- ✅ **Helpful Votes**: Click thumbs up on reviews
- ✅ **Owner Response**: (If you're the owner) Reply to reviews
- ✅ **Average Rating**: Check rating display at top

#### Expected Results:
- Review appears immediately
- Rating updates in real-time
- Photos display in gallery
- Helpful count increases on click

---

### **2. Booking System** 📅

#### Where to Test:
1. Go to any listing: `/listings/[listing-id]`
2. Find "Book Now" section

#### What to Test:
- ✅ **Create Booking**:
  - Select start date
  - Select end date
  - Add notes (optional)
  - Add special requests
  - Click "Request Booking"
- ✅ **View Your Bookings**: Go to Dashboard → Bookings
- ✅ **Booking Status**:
  - Pending (yellow)
  - Confirmed (green)
  - Cancelled (red)
  - Completed (blue)
- ✅ **Cancel Booking**: Click cancel button
- ✅ **Owner Actions**: (If you're the owner)
  - Accept booking
  - Reject booking

#### Expected Results:
- Booking request sent
- Notification to owner
- Status updates in real-time
- Calendar blocks dates

---

### **3. Notifications System** 🔔

#### Where to Test:
1. Click bell icon in header
2. Or go to: `/dashboard` → Notifications tab

#### What to Test:
- ✅ **Booking Notifications**:
  - New booking request
  - Booking confirmed
  - Booking cancelled
- ✅ **Review Notifications**:
  - New review on your listing
  - Owner responded to your review
- ✅ **Mark as Read**: Click notification
- ✅ **Mark All as Read**: Click "Mark all as read"
- ✅ **Delete Notification**: Click delete icon
- ✅ **Real-time Updates**: Open two browsers, trigger notification

#### Expected Results:
- Red badge shows unread count
- Notifications appear instantly
- Clicking navigates to relevant page
- Read status updates

---

### **4. Advanced Search** 🔍

#### Where to Test:
1. Go to: `/listings`
2. Use search bar and filters

#### What to Test:
- ✅ **Text Search**: Search by keyword
- ✅ **Category Filter**: Select category
- ✅ **Price Range**: Set min/max price
- ✅ **Location Filter**: Enter location
- ✅ **Condition Filter**: New, Like New, Good, Fair
- ✅ **Availability Filter**: Available dates
- ✅ **Sort Options**:
  - Newest first
  - Price: Low to High
  - Price: High to Low
  - Most Popular
- ✅ **Save Search**: Click "Save Search" button
- ✅ **Recent Searches**: View in search dropdown

#### Expected Results:
- Results filter instantly
- Saved searches appear in dropdown
- Recent searches show last 10
- Filters combine correctly

---

## 📋 **PHASE 2: Advanced Features Testing**

### **5. In-App Messaging** 💬

#### Where to Test:
1. Go to: `/dashboard` → Messages tab
2. Or click message icon in header

#### What to Test:
- ✅ **Start Conversation**:
  - Go to any listing
  - Click "Message Owner"
  - Type message
  - Send
- ✅ **View Conversations**: See all chats
- ✅ **Send Messages**:
  - Text messages
  - Image attachments
- ✅ **Read Status**: See read/unread
- ✅ **Typing Indicator**: See "User is typing..."
- ✅ **Real-time Chat**: Open two browsers, send messages
- ✅ **Block User**: Click block button
- ✅ **Report User**: Click report button

#### Expected Results:
- Messages appear instantly
- Typing indicator shows
- Images upload and display
- Unread count updates
- Blocked users can't message

---

### **6. Payment Integration** 💳

#### Where to Test:
1. After booking is confirmed
2. Go to: `/dashboard` → Bookings
3. Click "Pay Now" on confirmed booking

#### What to Test:
- ✅ **Razorpay Integration**:
  - Click "Pay Now"
  - Razorpay modal opens
  - Enter test card details
  - Complete payment
- ✅ **Payment Status**:
  - Pending → Completed
  - Payment ID recorded
- ✅ **Refunds**:
  - Cancel booking
  - Request refund
  - Check refund status
- ✅ **Payment History**: View all payments

#### Test Card Details:
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
```

#### Expected Results:
- Payment modal opens
- Payment processes successfully
- Status updates to "Completed"
- Payment ID stored
- Refunds process correctly

---

### **7. Verification System** ✅

#### Where to Test:
1. Go to: `/dashboard` → Profile
2. Click "Verify Account"

#### What to Test:
- ✅ **Phone Verification**:
  - Enter phone number
  - Receive OTP
  - Enter OTP
  - Verify
- ✅ **Email Verification**:
  - Check email
  - Click verification link
- ✅ **ID Verification**:
  - Upload ID document
  - Wait for admin approval
- ✅ **Trust Score**:
  - View trust score (0-100)
  - See verification badges
  - Check trust factors

#### Expected Results:
- OTP sent within 30 seconds
- Verification badges appear
- Trust score increases
- Verified badge shows on profile

---

## 📋 **PHASE 3: AI & Social Features Testing**

### **8. AI-Powered Recommendations** 🤖

#### Where to Test:
1. Go to: `/dashboard` → Home
2. See "Recommended for You" section
3. Or go to any listing page

#### What to Test:
- ✅ **Personalized Recommendations**:
  - View recommended items
  - Based on your booking history
  - Based on your searches
- ✅ **Similar Items**:
  - On listing page
  - See "Similar Items" section
  - Items in same category
- ✅ **Price Prediction**:
  - When creating listing
  - See "Suggested Price"
  - View confidence score
- ✅ **Demand Forecasting**:
  - View demand score
  - See peak days
  - Check trend (increasing/stable/decreasing)
- ✅ **Smart Pricing**:
  - Get pricing recommendations
  - See expected impact
  - Adjust price accordingly
- ✅ **Auto-Categorization**:
  - Enter item title/description
  - See suggested category
  - View confidence score

#### Expected Results:
- Recommendations relevant to you
- Similar items in same category
- Price predictions reasonable
- Demand trends accurate
- Categories suggested correctly

---

### **9. Social Features** 👥

#### Where to Test:
1. Go to: `/dashboard` → Social tab
2. Or visit any user profile

#### What to Test:
- ✅ **Follow/Unfollow**:
  - Go to user profile
  - Click "Follow" button
  - See follower count increase
  - Click "Unfollow"
- ✅ **Activity Feed**:
  - Go to `/dashboard` → Feed
  - See activities from followed users:
    - New listings posted
    - Bookings made
    - Reviews left
    - New followers
- ✅ **Share Listings**:
  - Go to any listing
  - Click "Share" button
  - Choose platform:
    - Facebook
    - Twitter
    - WhatsApp
    - LinkedIn
  - Share link opens
- ✅ **Referral Program**:
  - Go to `/dashboard` → Referrals
  - Copy your referral code
  - Share with friends
  - Track referrals
  - See rewards
- ✅ **Leaderboards**:
  - Go to `/dashboard` → Leaderboard
  - View rankings:
    - Most Listings
    - Most Bookings
    - Most Reviews
    - Top Earners
  - See your rank
  - View badges (🥇🥈🥉)

#### Expected Results:
- Follower counts update instantly
- Activity feed shows recent activities
- Share links work on all platforms
- Referral code tracks correctly
- Leaderboards rank accurately

---

### **10. Analytics Dashboard** 📊

#### Where to Test:
1. Go to: `/dashboard` → Analytics

#### What to Test:
- ✅ **Earnings Overview**:
  - Total earnings
  - This month vs last month
  - Growth percentage
  - Pending payments
- ✅ **Booking Statistics**:
  - Total bookings
  - Completed count
  - Pending count
  - Cancelled count
  - Completion rate %
- ✅ **Popular Items**:
  - Top 5 items by bookings
  - Earnings per item
  - Average rating per item
- ✅ **User Demographics**:
  - Age groups breakdown
  - Location distribution
  - User types (new, regular, power)
- ✅ **Performance Metrics**:
  - Average response time
  - Acceptance rate %
  - Cancellation rate %
  - Average rating
- ✅ **Export Reports**:
  - Click "Export" button
  - Choose report type:
    - Earnings Report
    - Bookings Report
    - Items Report
  - Download CSV file
- ✅ **AI Insights**:
  - View insights section
  - See actionable tips
  - Check achievements
  - View warnings

#### Expected Results:
- All metrics calculate correctly
- Charts display properly
- Growth percentages accurate
- CSV exports successfully
- Insights are relevant

---

## 🔍 **Quick Test Checklist**

### **Phase 1 (Core):**
- [ ] Add a review with rating
- [ ] Create a booking
- [ ] Receive notification
- [ ] Search for items
- [ ] Save a search

### **Phase 2 (Advanced):**
- [ ] Send a message
- [ ] Make a payment
- [ ] Verify phone number
- [ ] Block a user
- [ ] Request refund

### **Phase 3 (AI & Social):**
- [ ] Follow a user
- [ ] View activity feed
- [ ] Share a listing
- [ ] Use referral code
- [ ] View analytics dashboard
- [ ] Export a report

---

## 🐛 **Common Issues & Solutions**

### **Issue: Console Errors**
**Solution:** These are expected until you run `COMPLETE_DATABASE_SETUP.sql`

### **Issue: "Table doesn't exist"**
**Solution:** Run the database setup script in Supabase

### **Issue: "Not authenticated"**
**Solution:** Sign up/login first

### **Issue: "Permission denied"**
**Solution:** Check RLS policies are created

### **Issue: Notifications not working**
**Solution:** Make sure notifications table exists

### **Issue: Payments failing**
**Solution:** Set `VITE_RAZORPAY_KEY_ID` in `.env`

---

## 📱 **Testing on Different Devices**

### **Desktop:**
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### **Mobile:**
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Responsive design

### **Tablet:**
- ✅ iPad
- ✅ Android tablet

---

## 🎯 **Feature Locations Quick Reference**

| Feature | Location | Path |
|---------|----------|------|
| Reviews | Listing Page | `/listings/[id]` |
| Bookings | Dashboard | `/dashboard` → Bookings |
| Notifications | Header | Bell icon |
| Search | Listings | `/listings` |
| Messages | Dashboard | `/dashboard` → Messages |
| Payments | Bookings | Click "Pay Now" |
| Verification | Profile | `/dashboard` → Profile |
| AI Recommendations | Dashboard | `/dashboard` → Home |
| Social Feed | Dashboard | `/dashboard` → Feed |
| Leaderboard | Dashboard | `/dashboard` → Leaderboard |
| Analytics | Dashboard | `/dashboard` → Analytics |
| Referrals | Dashboard | `/dashboard` → Referrals |

---

## ✅ **All Features Working!**

After running `COMPLETE_DATABASE_SETUP.sql`, all features should work perfectly!

**Happy Testing!** 🎉
