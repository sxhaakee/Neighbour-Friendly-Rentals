# 📧 SETUP EMAIL SERVICE - COMPLETE GUIDE

## ❌ CURRENT ERROR

```
Error: Missing API key. Pass it to the constructor `new Resend("re_123")`
```

**Cause:** No Resend API key configured in environment variables.

---

## ✅ SOLUTION: SETUP RESEND EMAIL

### **Step 1: Sign Up for Resend**

1. **Go to:** https://resend.com
2. **Sign up** with GitHub or Email
3. **Free tier includes:**
   - 100 emails/day
   - 3,000 emails/month
   - Perfect for starting out!

### **Step 2: Get API Key**

1. **After signup:**
   - Dashboard → API Keys
   - Click "Create API Key"
   - Name: "NFRR Production"
   - Copy the key (starts with `re_`)

2. **IMPORTANT:** Save this key! You can't see it again.

### **Step 3: Add to Vercel Environment Variables**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: NFRR

2. **Settings → Environment Variables**

3. **Add new variable:**
   - **Name:** `VITE_RESEND_API_KEY`
   - **Value:** `re_xxxxxxxxxxxxx` (your API key)
   - **Environment:** Production, Preview, Development
   - Click "Save"

4. **Redeploy:**
   - Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes

### **Step 4: Verify Domain (Optional but Recommended)**

1. **In Resend Dashboard:**
   - Domains → Add Domain
   - Enter: `neighbourfriendly.in`

2. **Add DNS Records:**
   - Go to your domain registrar
   - Add the DNS records Resend provides
   - Wait 24-48 hours for verification

3. **Update Email From Address:**
   - After verification, update in code:
   - Change: `noreply@yourdomain.com`
   - To: `noreply@neighbourfriendly.in`

---

## 🧪 TEST EMAIL SETUP

### **After deploying with API key:**

1. **Go to your site**
2. **Make a test booking**
3. **Click "Approve & Send Emails"**
4. **Check console** - should see success!
5. **Check email inbox** - should receive email!

### **If still not working:**

Check Resend Dashboard → Logs to see delivery status

---

## 📝 CURRENT EMAIL TEMPLATES

Your app already has beautiful email templates for:

1. ✅ **Booking Confirmation** - Sent to renter
2. ✅ **Booking Notification** - Sent to owner
3. ✅ **Booking Approved** - Sent to renter
4. ✅ **Booking Rejected** - Sent to renter
5. ✅ **Payment Confirmation** - Sent to both
6. ✅ **Rental Agreement** - Sent to both

All templates are **professionally designed** with:
- Responsive layout
- Brand colors
- Clear information
- Call-to-action buttons

---

## 💰 PRICING

### **Resend Free Tier:**
- 100 emails/day
- 3,000 emails/month
- **Cost:** FREE

### **When to Upgrade:**
- If you send > 100 emails/day
- Need more than 3,000/month
- Paid plans start at $20/month

### **Alternative: SendGrid**
- Also has free tier
- 100 emails/day
- Similar setup process

---

## 🔒 SECURITY NOTES

### **NEVER commit API keys to GitHub!**

✅ **Correct:** Store in Vercel environment variables
❌ **Wrong:** Hardcode in code

### **API Key Format:**
```
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### **Keep it secret:**
- Don't share in screenshots
- Don't post in public forums
- Regenerate if exposed

---

## 📊 EMAIL DELIVERY TRACKING

### **In Resend Dashboard:**

1. **Logs Tab:**
   - See all sent emails
   - Delivery status
   - Open rates
   - Click rates

2. **Monitor:**
   - Bounces
   - Complaints
   - Unsubscribes

3. **Debug:**
   - Failed deliveries
   - Error messages
   - Retry attempts

---

## 🎯 COMPLETE CHECKLIST

- [ ] Sign up for Resend
- [ ] Get API key
- [ ] Add to Vercel environment variables
- [ ] Redeploy site
- [ ] Test booking email
- [ ] Verify email received
- [ ] (Optional) Verify domain
- [ ] (Optional) Update from address

---

## 🚀 AFTER SETUP

**Emails will be sent automatically for:**

1. **New Booking** → Owner notified
2. **Booking Approved** → Renter notified
3. **Booking Rejected** → Renter notified
4. **Payment Completed** → Both notified
5. **Rental Agreement** → Both receive PDF

**All emails are:**
- ✅ Professionally designed
- ✅ Mobile responsive
- ✅ Include all details
- ✅ Have clear CTAs
- ✅ Match your brand

---

## ⏱️ TIME REQUIRED

**Total:** 15 minutes

**Breakdown:**
- Sign up for Resend: 3 minutes
- Get API key: 1 minute
- Add to Vercel: 2 minutes
- Redeploy: 3 minutes
- Test: 5 minutes
- Domain verification: 24-48 hours (optional)

---

## 📝 SUMMARY

**Quick Fix:**
1. Sign up: https://resend.com
2. Get API key
3. Add to Vercel: `VITE_RESEND_API_KEY`
4. Redeploy
5. Done! ✅

**Result:**
- ✅ Emails work
- ✅ No more errors
- ✅ Professional templates
- ✅ Automatic delivery
- ✅ Free (up to 3,000/month)

---

**Sign up for Resend now and add the API key to Vercel - emails will work in 15 minutes!** 🚀
