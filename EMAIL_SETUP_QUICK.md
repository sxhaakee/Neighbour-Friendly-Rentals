# 📧 Email Service Setup - Quick Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Resend API Key

1. Go to: **https://resend.com/**
2. Sign up with your email
3. Go to **API Keys** → Click **"Create API Key"**
4. Name it: "NFRR Production"
5. **Copy the key** (starts with `re_`)

### Step 2: Add to Environment

**Option A: Local Development (.env file)**
```bash
# Open .env file
nano .env

# Add this line:
VITE_RESEND_API_KEY=re_your_actual_key_here

# Save: Ctrl+X, Y, Enter
```

**Option B: Vercel Deployment**
1. Go to: **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Name:** `VITE_RESEND_API_KEY`
   - **Value:** `re_your_actual_key_here`
3. Click **Save**
4. **Redeploy** your app

### Step 3: Verify Domain (Important!)

1. Go to **Resend Dashboard** → **Domains**
2. Click **"Add Domain"**
3. Enter: `neighbourfriendly.in`
4. **Copy DNS records** (TXT, MX, CNAME)
5. Add to your domain provider (GoDaddy/Namecheap/etc.)
6. Wait 10-30 minutes
7. Click **"Verify"** in Resend

---

## ✅ Test Emails

### After Setup:

```bash
# Restart your dev server
npm run dev
```

### Test by:
1. **Sign up** with a new account → Check welcome email
2. **Make a booking** → Check booking confirmation
3. **Approve/reject booking** → Check status emails

---

## 📧 Emails That Will Work

Once configured, these emails will be sent automatically:

1. ✅ **Welcome Email** - On signup
2. ✅ **Booking Confirmation** - When booking is made
3. ✅ **Booking Approved** - When owner approves
4. ✅ **Booking Rejected** - When owner rejects
5. ✅ **Payment Confirmation** - After payment
6. ✅ **Premium Upgrade** - After premium purchase

---

## 🔧 Troubleshooting

### "Emails not sending?"

**Check 1: API Key**
```bash
# Verify .env has the key
cat .env | grep RESEND
```

**Check 2: Domain Verification**
- Go to Resend Dashboard → Domains
- Status should be "Verified" ✅

**Check 3: Console Logs**
- Open browser console (F12)
- Look for email logs: `📧 Email sent:`

---

## 🎯 Production Checklist

- [ ] Created Resend account
- [ ] Generated API key
- [ ] Added to Vercel environment variables
- [ ] Verified domain in Resend
- [ ] Added DNS records
- [ ] Redeployed app
- [ ] Tested emails

---

## 📞 Need Help?

**Resend Support:**
- Docs: https://resend.com/docs
- Email: support@resend.com

**Check Logs:**
- Browser console (F12)
- Resend Dashboard → Emails

---

**That's it! Your emails will work once you:**
1. Add API key to environment
2. Verify domain in Resend
3. Redeploy/restart app

🎉 **Simple!**
