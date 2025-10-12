# 🚀 Deployment Guide - NFRR Rental Marketplace

This guide will walk you through deploying your NFRR Rental Marketplace to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Google OAuth Setup](#google-oauth-setup)
4. [Google Analytics Setup](#google-analytics-setup)
5. [Razorpay Setup](#razorpay-setup)
6. [Frontend Deployment (Vercel/Netlify)](#frontend-deployment)
7. [Environment Variables](#environment-variables)
8. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ A Supabase account (free tier available)
- ✅ A Google Cloud account (for OAuth)
- ✅ A Google Analytics account (optional but recommended)
- ✅ A Razorpay account (for payments in India)
- ✅ Git installed on your machine
- ✅ Node.js 18+ installed

---

## 🗄️ Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if you don't have one)
4. Create a new project:
   - **Project name**: `nfrr-rental` (or your choice)
   - **Database password**: Save this securely!
   - **Region**: Choose closest to your users
   - **Pricing plan**: Free tier is sufficient for 1000+ listings

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste and click **Run**
5. Verify all tables are created in **Table Editor**

### Step 3: Configure Storage

1. Go to **Storage** in Supabase dashboard
2. The `listing-images` bucket should already be created by the schema
3. Verify the bucket is **public**
4. Storage policies are already set up in the schema

### Step 4: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
3. Save these for environment variables

---

## 🔐 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: **NFRR Rental**
3. Enable **Google+ API**

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in:
   - **App name**: NFRR Rental Marketplace
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (your email) if in testing mode

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   ```
   http://localhost:5173
   https://your-supabase-project.supabase.co/auth/v1/callback
   https://your-production-domain.com
   ```
5. Save **Client ID** and **Client Secret**

### Step 4: Configure in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google**
3. Enter your **Client ID** and **Client Secret**
4. Save changes

---

## 📊 Google Analytics Setup

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** → **Create Property**
3. Fill in property details:
   - **Property name**: NFRR Rental Marketplace
   - **Time zone**: Your timezone
   - **Currency**: INR (or your currency)

### Step 2: Create Data Stream

1. Click **Data Streams** → **Add stream** → **Web**
2. Enter your website URL
3. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)
4. Save for environment variables

---

## 💳 Razorpay Setup

### Step 1: Create Razorpay Account

1. Go to [razorpay.com](https://razorpay.com/)
2. Sign up for an account
3. Complete KYC verification (required for live mode)

### Step 2: Get API Keys

1. Go to **Settings** → **API Keys**
2. Generate keys for **Test Mode** (for development)
3. Copy **Key ID** (starts with `rzp_test_`)
4. For production, generate **Live Mode** keys after KYC

---

## 🌐 Frontend Deployment

### Option A: Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub**:
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com/)
   - Click **Import Project**
   - Select your repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add environment variables (see below)
   - Click **Deploy**

3. **Custom Domain** (optional):
   - Go to project settings → **Domains**
   - Add your custom domain
   - Update DNS records as instructed

### Option B: Netlify

1. **Deploy via GitHub**:
   - Push code to GitHub
   - Go to [netlify.com](https://netlify.com/)
   - Click **New site from Git**
   - Select repository
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Add environment variables
   - Click **Deploy**

2. **Update Redirects**:
   Create `public/_redirects`:
   ```
   /*    /index.html   200
   ```

---

## 🔑 Environment Variables

Create a `.env` file in your project root (for local development):

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# App URL
VITE_APP_URL=https://your-domain.com
```

### For Production Deployment:

**Vercel**:
- Go to project → **Settings** → **Environment Variables**
- Add each variable with production values

**Netlify**:
- Go to **Site settings** → **Build & deploy** → **Environment**
- Add each variable

⚠️ **Important**: Never commit `.env` to Git! It's already in `.gitignore`.

---

## ✅ Post-Deployment Checklist

### 1. Test Core Features

- [ ] User registration (email + Google OAuth)
- [ ] User login
- [ ] Create a listing (test image compression)
- [ ] Search and filter listings
- [ ] View item details
- [ ] Leave a review
- [ ] Contact owner (chat)
- [ ] Book an item
- [ ] Admin approval workflow

### 2. Verify Integrations

- [ ] Supabase connection working
- [ ] Google OAuth login working
- [ ] Google Analytics tracking pageviews
- [ ] Razorpay payment flow (test mode)
- [ ] Image uploads to Supabase Storage
- [ ] Real-time chat working

### 3. Performance Checks

- [ ] Images are compressed (< 100KB each)
- [ ] Page load times < 3 seconds
- [ ] Mobile responsive design
- [ ] No console errors

### 4. Security

- [ ] Row Level Security (RLS) enabled in Supabase
- [ ] Environment variables not exposed
- [ ] HTTPS enabled on production domain
- [ ] OAuth redirect URIs configured correctly

### 5. SEO & Analytics

- [ ] Google Analytics tracking events
- [ ] Meta tags configured
- [ ] Sitemap generated (optional)
- [ ] robots.txt configured (optional)

---

## 📱 Mobile App (Future)

This codebase can be adapted for mobile using:
- **React Native** (recommended)
- **Capacitor** (easier migration)

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution**: Verify `.env` file exists and variables are prefixed with `VITE_`

### Issue: Google OAuth not working
**Solution**: 
1. Check redirect URIs in Google Cloud Console
2. Verify Client ID/Secret in Supabase
3. Clear browser cache

### Issue: Images not uploading
**Solution**:
1. Check Supabase Storage policies
2. Verify bucket is public
3. Check file size (should be < 100KB after compression)

### Issue: Chat not working
**Solution**:
1. Verify Supabase Realtime is enabled
2. Check RLS policies for conversations/messages tables
3. Check browser console for WebSocket errors

---

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review Supabase logs
3. Check browser console for errors
4. Review this deployment guide

---

## 🎉 Congratulations!

Your NFRR Rental Marketplace is now live! 🚀

**Next Steps**:
1. Share with beta users
2. Monitor Google Analytics
3. Collect feedback
4. Iterate and improve

---

**Last Updated**: October 2025
**Version**: 1.0.0
