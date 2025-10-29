# 🚀 COMPLETE SETUP INSTRUCTIONS

## ⚡ STEP 1: DATABASE SETUP (DO THIS NOW!)

### Instructions:
1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your NFRR project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the ENTIRE content from `ADD_EMAIL_AUTOMATION_TABLES.sql`
6. Paste it into the SQL editor
7. Click "Run" (or press Cmd/Ctrl + Enter)
8. Wait for success message: "✅ Email automation tables created successfully!"

### Verification:
- Go to "Table Editor"
- You should see new tables: `scheduled_emails`, `email_campaigns`, `email_events`, `email_preferences`, `affiliate_clicks`, `revenue_tracking`

---

## ⚡ STEP 2: RESEND EMAIL SETUP (5 minutes)

### Instructions:
1. Go to: https://resend.com/signup
2. Sign up with your email: friendlyrentals.mlr@gmail.com
3. Verify your email
4. Go to "API Keys" section
5. Click "Create API Key"
6. Name it: "NFRR Production"
7. Copy the API key (starts with `re_`)

### Add to Environment:
1. Open your `.env` file (create if doesn't exist)
2. Add this line:
   ```
   VITE_RESEND_API_KEY=re_your_api_key_here
   ```
3. Save the file
4. Restart your dev server

### Test Email:
```bash
# In your terminal
npm run dev
```

Then test by signing up a new user - they should receive welcome email!

---

## ⚡ STEP 3: RAZORPAY SETUP (10 minutes)

### Instructions:
1. Go to: https://razorpay.com/
2. Click "Sign Up"
3. Fill in business details:
   - Business Name: NeighbourFriendly Rentals
   - Email: friendlyrentals.mlr@gmail.com
   - Phone: 8746934346
4. Complete KYC verification
5. Go to "Settings" → "API Keys"
6. Generate Test Keys (for development)
7. Generate Live Keys (for production)

### Add to Environment:
```env
# Razorpay Test Keys (for development)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_RAZORPAY_KEY_SECRET=your_key_secret

# Razorpay Live Keys (for production - add later)
# VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id
# VITE_RAZORPAY_KEY_SECRET=your_key_secret
```

---

## ⚡ STEP 4: GOOGLE ADSENSE SETUP (15 minutes)

### Instructions:
1. Go to: https://www.google.com/adsense/start/
2. Sign in with your Gmail
3. Click "Get Started"
4. Enter your website: neighbourfriendly.vercel.app
5. Fill in your details:
   - Name: Mohammed Shakeeb
   - Address: Your address
   - Phone: 8746934346
6. Accept terms and conditions
7. Copy the AdSense code snippet
8. I'll add it to your site automatically!

### Approval Timeline:
- Usually takes 1-3 days
- Google will review your site
- You'll get email notification
- Once approved, ads will start showing

---

## ⚡ STEP 5: VERIFY EVERYTHING WORKS

### Checklist:
- [ ] Database tables created in Supabase
- [ ] Resend API key added to .env
- [ ] Razorpay account created
- [ ] Razorpay keys added to .env
- [ ] Google AdSense application submitted
- [ ] Dev server running without errors

---

## 🎯 WHAT'S NEXT?

Once you complete these steps, tell me:
"Setup complete!" 

And I'll:
1. Add Razorpay payment integration
2. Add Google AdSense code
3. Launch email campaigns
4. Set up revenue tracking
5. Create admin dashboard for monitoring

---

## 🆘 NEED HELP?

If you get stuck on any step, just tell me:
- "Help with Supabase"
- "Help with Resend"
- "Help with Razorpay"
- "Help with AdSense"

I'll guide you through it! 💪
