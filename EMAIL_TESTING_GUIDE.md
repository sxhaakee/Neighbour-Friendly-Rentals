# 📧 Email Testing Guide

## ✅ What's Fixed

- ✅ Domain verified in Resend: `friendlyrentals.ml`
- ✅ Email addresses updated to match domain
- ✅ Code deployed to Vercel

---

## 🧪 How to Test Emails

### Test 1: Welcome Email (Sign Up)

1. **Go to your website:** https://neighbourfriendly.in/login
2. **Click "Sign Up" tab**
3. **Fill in the form:**
   - Name: Test User
   - Email: **YOUR_REAL_EMAIL@gmail.com** (use your actual email!)
   - Password: test123456
4. **Click "Create Account"**
5. **Check your email inbox** (might take 1-2 minutes)

**Expected Result:**
- ✅ Email from: `NeighbourFriendly Rentals <noreply@neighbourfriendly.in>`
- ✅ Subject: "🎉 Welcome to NeighbourFriendly Rentals - Start Earning & Saving Today!"
- ✅ Beautiful HTML email with gold theme

---

### Test 2: Booking Confirmation Email

1. **Log in to your account**
2. **Browse listings**
3. **Book an item**
4. **Complete the booking**
5. **Check your email**

**Expected Result:**
- ✅ Email from: `NeighbourFriendly Rentals <noreply@friendlyrentals.ml>`
- ✅ Subject: "Booking Confirmation - [Item Name]"
- ✅ Booking details, payment info, contact details

---

## 🔍 Check Email Delivery Status

### In Resend Dashboard:

1. Go to: https://resend.com/emails
2. You'll see all sent emails
3. Check status:
   - ✅ **Delivered** = Success!
   - ⏳ **Queued** = Processing
   - ❌ **Failed** = Error (check logs)

---

## 🚨 Troubleshooting

### Problem 1: "Email not received"

**Check:**
1. **Spam folder** - Check your spam/junk folder
2. **Email address** - Make sure you used a real email
3. **Resend dashboard** - Check if email was sent
4. **Browser console** - Press F12, check for errors

**Solution:**
```bash
# Check Vercel logs
# Go to: Vercel Dashboard → Your Project → Logs
# Look for: "📧 Sending Welcome Email to:"
```

### Problem 2: "API key not configured"

**Check Vercel Environment Variables:**
1. Go to: Vercel Dashboard → Settings → Environment Variables
2. Verify: `VITE_RESEND_API_KEY` exists
3. If missing, add it and **redeploy**

### Problem 3: "Domain not verified"

**Check Resend:**
1. Go to: https://resend.com/domains
2. Status should be: ✅ **Verified**
3. If not, check DNS records in GoDaddy

### Problem 4: "Failed to send"

**Check Browser Console:**
```javascript
// Press F12 → Console tab
// Look for errors like:
// "Error sending welcome email: ..."
```

**Common Errors:**
- `Invalid from address` → Domain not verified
- `API key invalid` → Wrong API key
- `Rate limit exceeded` → Too many emails (wait 1 hour)

---

## 📊 Email Logs

### Where to Check:

**1. Browser Console (F12):**
```
📧 Sending Welcome Email to: user@example.com
Email Subject: 🎉 Welcome to NeighbourFriendly Rentals
```

**2. Vercel Logs:**
- Go to: Vercel Dashboard → Your Project → Logs
- Filter by: "email"

**3. Resend Dashboard:**
- Go to: https://resend.com/emails
- See all sent emails with status

---

## ✅ Success Checklist

- [ ] Domain verified in Resend ✅
- [ ] DNS records added to GoDaddy ✅
- [ ] API key added to Vercel ✅
- [ ] Code deployed to Vercel ✅
- [ ] Tested sign up → Email received ⬅️ **TEST THIS**
- [ ] Checked spam folder
- [ ] Checked Resend dashboard

---

## 🎯 Quick Test Command

**Test if API key is working:**

1. Open browser console (F12)
2. Go to your website
3. Sign up with a new account
4. Watch console for:
   ```
   📧 Sending Welcome Email to: your@email.com
   ```

If you see this, email is being sent!

---

## 📧 Email Templates Available

Your app sends these emails automatically:

1. **Welcome Email** - On sign up
2. **Booking Confirmation** - When booking is made
3. **ID Verification Approved** - When ID is verified
4. **ID Verification Rejected** - When ID is rejected
5. **Payment Reminder** - Before pickup date

---

## 🔧 Manual Test (If Needed)

If automatic emails don't work, test manually:

```bash
# 1. Check if Resend API key is valid
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "NeighbourFriendly Rentals <noreply@friendlyrentals.ml>",
    "to": "your@email.com",
    "subject": "Test Email",
    "html": "<p>This is a test email!</p>"
  }'
```

Replace `YOUR_API_KEY` with your actual Resend API key.

---

## 📞 Need Help?

**If emails still don't work:**

1. **Take screenshots of:**
   - Resend dashboard (domain status)
   - Vercel environment variables
   - Browser console errors
   - Resend email logs

2. **Check:**
   - Is domain verified? ✅
   - Is API key correct? ✅
   - Is app deployed? ✅
   - Did you wait 1-2 minutes? ✅

3. **Common fixes:**
   - Redeploy Vercel app
   - Check spam folder
   - Try different email address
   - Wait for DNS propagation (if just verified)

---

## 🎉 Expected Result

When everything works:

1. **User signs up** → Welcome email sent instantly
2. **User books item** → Confirmation email sent
3. **All emails** appear in Resend dashboard as "Delivered"
4. **User receives** beautiful HTML emails with gold theme

---

**Your emails should work now! Test by signing up with a real email address!** 📧✨
