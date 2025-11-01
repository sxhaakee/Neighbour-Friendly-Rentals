# 🚀 Production Email Setup - Complete Guide

## ✅ What's Ready

**Edge Function Created:**
- ✅ `/supabase/functions/send-email/index.ts` - Complete with all templates
- ✅ `/supabase/functions/_shared/cors.ts` - CORS headers
- ✅ Welcome, Booking, ID Verification emails

**React Code Updated:**
- ✅ `emailService.ts` - Calls Edge Function instead of browser Resend
- ✅ `AuthContext.tsx` - Triggers welcome email on signup
- ✅ No more CORS errors!

---

## 🎯 Deploy to Production (5 Steps)

### Step 1: Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### Step 2: Link Your Project

```bash
# Go to your project directory
cd /Users/mohammedshakeeb/Desktop/NFRR

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

**Get YOUR_PROJECT_REF:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Settings → General → Reference ID

### Step 3: Set Resend API Key Secret

```bash
# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=re_eGVhpxbn_9jDbf4nEBdia2XZ1PyPRokTo
```

**Your API key:** `re_eGVhpxbn_9jDbf4nEBdia2XZ1PyPRokTo`

### Step 4: Deploy Edge Function

```bash
# Deploy the send-email function
supabase functions deploy send-email
```

**Expected output:**
```
✅ Deploying function send-email...
✅ Function deployed successfully
✅ URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email
```

### Step 5: Test the Function

```bash
# Test with curl
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "type": "welcome",
    "data": {
      "userName": "Test User",
      "dashboardUrl": "https://neighbourfriendly.in/dashboard"
    }
  }'
```

**Get YOUR_ANON_KEY:**
1. Supabase Dashboard → Settings → API
2. Copy "anon public" key

---

## 📧 Verify Domain in Resend (CRITICAL!)

**Before emails will actually send:**

1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter: `neighbourfriendly.in`
4. Copy the 3 DNS records:
   - TXT record (verification)
   - MX record (receiving)
   - CNAME record (DKIM)
5. Add to your domain provider (GoDaddy/Namecheap/Cloudflare)
6. Wait 10-30 minutes
7. Click "Verify" in Resend

**Status check:**
```bash
# Check DNS propagation
dig TXT neighbourfriendly.in
dig MX neighbourfriendly.in
```

---

## 🧪 Test in Production

### Test 1: Welcome Email

1. Go to your live site
2. Sign up with a new account
3. Check console: "✅ Welcome email sent successfully"
4. Check email inbox
5. Check Resend dashboard: https://resend.com/emails

### Test 2: Booking Email

1. Create a listing
2. Make a booking
3. Approve as admin
4. Check console and email

### Test 3: Check Supabase Logs

```bash
# View function logs
supabase functions logs send-email
```

Or in dashboard:
1. Supabase Dashboard → Edge Functions
2. Click "send-email"
3. View logs

---

## 📊 Available Email Types

Your Edge Function supports these email types:

```typescript
// Welcome email
{
  email: "user@example.com",
  type: "welcome",
  data: {
    userName: "John Doe",
    dashboardUrl: "https://neighbourfriendly.in/dashboard"
  }
}

// Booking confirmation
{
  email: "user@example.com",
  type: "bookingConfirmation",
  data: {
    orderId: "123",
    itemTitle: "Camera",
    startDate: "Nov 1, 2024",
    endDate: "Nov 5, 2024",
    totalPrice: "5000"
  }
}

// ID verification approved
{
  email: "user@example.com",
  type: "idVerificationApproved",
  data: {
    userName: "John Doe"
  }
}

// ID verification rejected
{
  email: "user@example.com",
  type: "idVerificationRejected",
  data: {
    userName: "John Doe",
    reason: "Document not clear"
  }
}
```

---

## 🔍 Troubleshooting

### Error: "Function not found"

**Solution:**
```bash
# Redeploy function
supabase functions deploy send-email

# Check if deployed
supabase functions list
```

### Error: "RESEND_API_KEY not configured"

**Solution:**
```bash
# Set secret again
supabase secrets set RESEND_API_KEY=re_eGVhpxbn_9jDbf4nEBdia2XZ1PyPRokTo

# Verify secret is set
supabase secrets list
```

### Error: "Domain not verified"

**Solution:**
1. Check Resend dashboard
2. Verify DNS records are added
3. Wait up to 24 hours for propagation
4. Use https://dnschecker.org/ to verify

### Error: "Failed to send email"

**Check:**
1. Resend dashboard for error details
2. Supabase function logs
3. Domain verification status
4. API key is correct

---

## 💰 Costs

### Supabase Edge Functions
- ✅ **Free tier:** 500,000 invocations/month
- ✅ **More than enough** for your needs

### Resend
- ✅ **Free tier:** 100 emails/day (3,000/month)
- ✅ **Paid:** $20/month for 50,000 emails

**Your usage estimate:**
- ~10-50 emails/day = FREE
- If you grow: Upgrade to paid plan

---

## 🎯 Quick Commands Reference

```bash
# Login to Supabase
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Set secret
supabase secrets set RESEND_API_KEY=YOUR_KEY

# Deploy function
supabase functions deploy send-email

# View logs
supabase functions logs send-email

# Test locally (optional)
supabase functions serve send-email
```

---

## ✅ Deployment Checklist

**Before deploying:**
- [x] Edge Function created
- [x] CORS file created
- [x] React code updated
- [ ] **→ Supabase CLI installed**
- [ ] **→ Project linked**
- [ ] **→ API key secret set**
- [ ] **→ Function deployed**

**After deploying:**
- [ ] Domain verified in Resend
- [ ] Test welcome email
- [ ] Test booking email
- [ ] Check Supabase logs
- [ ] Check Resend dashboard
- [ ] Monitor for 24 hours

---

## 📞 Support

### Supabase
- **Dashboard:** https://supabase.com/dashboard
- **Docs:** https://supabase.com/docs/guides/functions
- **Discord:** https://discord.supabase.com

### Resend
- **Dashboard:** https://resend.com/
- **Docs:** https://resend.com/docs
- **Support:** support@resend.com

---

## 🚀 Next Steps After Deployment

1. **Monitor first 24 hours:**
   - Check Supabase logs
   - Check Resend dashboard
   - Test all email types

2. **Add more email templates:**
   - Payment reminders
   - Review requests
   - Weekly digests

3. **Set up email analytics:**
   - Track open rates
   - Track click rates
   - Monitor bounces

4. **Optimize:**
   - A/B test subject lines
   - Improve templates
   - Add personalization

---

**Last Updated:** November 1, 2024, 11:40 AM IST  
**Status:** ✅ Ready for Production Deployment!

**Deploy now with:** `supabase functions deploy send-email`
