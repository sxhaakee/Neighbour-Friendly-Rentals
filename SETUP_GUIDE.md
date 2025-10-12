# NFRR - Complete Setup Guide

## 🎯 Overview

NFRR (Neighbour Friendly Rental Resource) is a full-stack multi-vendor rental marketplace platform built with React, TypeScript, Supabase, and Razorpay. This guide will walk you through the complete setup process.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account (free tier works)
- A Razorpay account (for payment integration)
- Git

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd NFRR
npm install
```

### 2. Supabase Setup

#### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if you don't have one)
4. Click "New Project"
5. Fill in the details:
   - **Project Name**: NFRR or any name you prefer
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development

#### Step 2: Get Your API Keys

1. Once your project is created, go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. Copy the following:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (this is safe to use in your frontend)

#### Step 3: Run the Database Schema

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from the project root
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Wait for all queries to execute successfully

You should see messages like:
- ✅ Tables created
- ✅ Policies created
- ✅ Functions created
- ✅ Storage bucket created

#### Step 4: Configure Storage

The schema automatically creates a storage bucket called `listing-images`. Verify it:

1. Click on **Storage** in the left sidebar
2. You should see a bucket named `listing-images`
3. The bucket is already configured as public (for viewing images)

#### Step 5: Create an Admin User

1. Go to **Authentication** > **Users** in Supabase dashboard
2. Click **Add User** > **Create new user**
3. Enter:
   - **Email**: your admin email
   - **Password**: create a secure password
   - **Auto Confirm User**: Check this box
4. Click **Create User**
5. Now, go to **SQL Editor** and run this query to make the user an admin:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

Replace `your-admin-email@example.com` with the email you just created.

### 3. Razorpay Setup

#### Step 1: Create a Razorpay Account

1. Go to [https://razorpay.com](https://razorpay.com)
2. Click **Sign Up** and create an account
3. Complete the verification process

#### Step 2: Get API Keys

1. Log in to Razorpay Dashboard
2. Go to **Settings** > **API Keys**
3. Click **Generate Test Key** (for development)
4. Copy the **Key ID** (starts with `rzp_test_`)
5. **Important**: Keep the **Key Secret** safe (you'll need it for backend verification)

### 4. Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

# App Configuration
VITE_APP_URL=http://localhost:5173
```

### 5. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔐 User Roles

The platform has two user roles:

### 1. Customer (Default)
- Can browse listings
- Can create listings (pending admin approval)
- Can rent items
- Can manage their own listings and bookings

### 2. Admin
- All customer permissions
- Can approve/reject listings
- Can view all listings and bookings
- Access to admin dashboard at `/admin`

## 📱 Features Implemented

### ✅ Completed Features

1. **Authentication System**
   - Email/password signup and login
   - Role-based access control (Customer/Admin)
   - Protected routes
   - User profile management

2. **Listing Management**
   - Create listings with multiple images
   - Image upload to Supabase Storage
   - Category-based filtering
   - Search functionality
   - Price range filtering
   - Admin approval workflow

3. **Admin Dashboard**
   - View all listings
   - Approve/reject listings
   - Statistics and analytics
   - User management

4. **User Dashboard**
   - View own listings
   - Manage listings
   - View booking history

5. **Database & Storage**
   - Supabase PostgreSQL database
   - Row Level Security (RLS) policies
   - Image storage with public access
   - Automatic profile creation on signup

## 🚧 Features to Implement

### 1. Booking System (Partially Implemented)

The booking service is created but needs frontend integration. You need to:

1. **Create Booking Page** (`src/pages/BookItem.tsx`):
   - Date picker for start and end dates
   - Calculate total price based on days
   - Show availability calendar
   - Integrate with Razorpay payment

2. **Update ItemDetails Page**:
   - Add "Book Now" button
   - Navigate to booking page with listing ID

### 2. Razorpay Payment Integration

The payment service is created but needs backend verification. You need to:

1. **Create a Backend API** (Node.js/Express recommended):
   ```javascript
   // Example endpoint
   POST /api/payment/create-order
   // Creates Razorpay order and returns order_id
   
   POST /api/payment/verify
   // Verifies payment signature
   ```

2. **Update Payment Flow**:
   - Call backend to create order
   - Display Razorpay checkout
   - Verify payment on backend
   - Update booking status

### 3. Review System

The review service is created. You need to:

1. Add review form to ItemDetails page
2. Display reviews with ratings
3. Calculate average ratings

### 4. Notifications

Implement email notifications for:
- Listing approval/rejection
- New booking requests
- Payment confirmations

## 🔧 Backend API Requirements

For production, you need to create a backend API for:

### 1. Razorpay Order Creation

```javascript
// POST /api/payment/create-order
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/api/payment/create-order', async (req, res) => {
  const { amount, bookingId } = req.body;
  
  const options = {
    amount: amount * 100, // amount in paise
    currency: 'INR',
    receipt: `booking_${bookingId}`,
  };
  
  try {
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});
```

### 2. Payment Verification

```javascript
// POST /api/payment/verify
const crypto = require('crypto');

app.post('/api/payment/verify', (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  
  if (expectedSignature === signature) {
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false });
  }
});
```

## 📊 Database Schema

The database includes the following tables:

1. **profiles** - User profiles with role management
2. **listings** - Rental items with approval status
3. **bookings** - Rental bookings with payment tracking
4. **reviews** - User reviews and ratings

All tables have Row Level Security (RLS) enabled for data protection.

## 🎨 Customization

### Branding

1. Update logo: Replace `/public/LOGOOO.jpg`
2. Update colors in `tailwind.config.js`:
   ```javascript
   colors: {
     primary: '#10B981', // Your brand color
     secondary: '#FCD34D', // Your accent color
   }
   ```

### Email Templates

Configure email templates in Supabase:
1. Go to **Authentication** > **Email Templates**
2. Customize confirmation, reset password, and magic link emails

## 🚀 Deployment

### Frontend Deployment (Vercel - Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Import Project**
4. Select your GitHub repository
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
   - `VITE_APP_URL`
6. Click **Deploy**

### Backend Deployment (if you create one)

Options:
- **Heroku**: Easy deployment with free tier
- **Railway**: Modern platform with great DX
- **AWS Lambda**: Serverless option
- **DigitalOcean**: VPS option

## 🔒 Security Checklist

- [ ] Never commit `.env` file
- [ ] Use environment variables for all secrets
- [ ] Enable RLS on all Supabase tables
- [ ] Verify Razorpay payments on backend
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Validate all user inputs
- [ ] Sanitize file uploads

## 🐛 Troubleshooting

### Issue: "Cannot find module './database.types'"

This is a TypeScript warning. The types file exists and will work at runtime. To fix:
```bash
npm run dev
```
The Vite dev server will resolve the types correctly.

### Issue: Images not uploading

1. Check Supabase Storage bucket exists
2. Verify storage policies are set correctly
3. Check file size limits (default: 50MB)
4. Ensure user is authenticated

### Issue: Admin dashboard not accessible

1. Verify user role in database:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
   ```
2. Update role if needed:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### Issue: Payments not working

1. Ensure you're using test mode keys
2. Check Razorpay dashboard for errors
3. Verify VITE_RAZORPAY_KEY_ID is set correctly
4. Implement backend verification (required for production)

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Support

For issues and questions:
1. Check this guide first
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Review network tab for API errors

## 📝 Next Steps

1. ✅ Complete Supabase setup
2. ✅ Configure environment variables
3. ✅ Create admin user
4. ⏳ Implement booking page
5. ⏳ Create backend API for payments
6. ⏳ Add review functionality
7. ⏳ Deploy to production

---

**Built with ❤️ for the rental economy**
