# Resend Email Setup Guide

## 🚨 Current Issue
Resend emails are not working because the API key is not configured properly.

---

## ✅ Step-by-Step Fix

### Step 1: Get Resend API Key

1. **Go to Resend Dashboard:**
   - Visit: https://resend.com/
   - Sign up or login with your email

2. **Create API Key:**
   - Go to **API Keys** section
   - Click **"Create API Key"**
   - Name it: "NFRR Production"
   - Copy the key (starts with `re_`)

### Step 2: Add API Key to Environment

1. **Open your `.env` file:**
   ```bash
   nano .env
   ```

2. **Add the Resend API key:**
   ```env
   VITE_RESEND_API_KEY=re_your_actual_api_key_here
   ```

3. **Save and close** (Ctrl+X, Y, Enter)

### Step 3: Verify Domain (Important!)

Resend requires domain verification to send emails:

1. **Go to Resend Dashboard > Domains**
2. **Click "Add Domain"**
3. **Enter your domain:** `neighbourfriendly.in`
4. **Add DNS Records:**
   - Copy the TXT, MX, and CNAME records
   - Add them to your domain DNS settings (GoDaddy, Namecheap, etc.)
   - Wait 10-30 minutes for propagation

5. **Verify Domain:**
   - Click "Verify" in Resend dashboard
   - Once verified, you can send emails from `noreply@neighbourfriendly.in`

---

## 📧 Email Configuration

### Update Email Service

The email service is already configured in `/src/services/emailService.ts`:

```typescript
const getResendClient = () => {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ Resend API key not configured. Emails will be logged only.');
    return null;
  }
  return new Resend(apiKey);
};
```

### Email Templates Available

1. **Welcome Email** - Sent on signup
2. **Booking Confirmation** - Sent when booking is made
3. **Booking Approved** - Sent when owner approves
4. **Booking Rejected** - Sent when owner rejects
5. **Payment Confirmation** - Sent after successful payment
6. **Premium Upgrade** - Sent after premium purchase

---

## 🧪 Test Emails

### Step 1: Restart Dev Server

After adding the API key:

```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

### Step 2: Test Welcome Email

1. Create a new account
2. Check console for email logs
3. Check your email inbox

### Step 3: Test Booking Email

1. Make a test booking
2. Approve/reject it
3. Check emails

---

## 🔧 Troubleshooting

### Error: "API key not configured"

**Solution:**
```bash
# Check if .env file has the key
cat .env | grep RESEND

# Should show:
# VITE_RESEND_API_KEY=re_xxxxx

# If not, add it:
echo "VITE_RESEND_API_KEY=re_your_key_here" >> .env
```

### Error: "Domain not verified"

**Solution:**
1. Go to Resend Dashboard > Domains
2. Check verification status
3. If pending, check DNS records
4. Use `dig` to verify DNS:
   ```bash
   dig TXT neighbourfriendly.in
   ```

### Error: "Failed to send email"

**Solution:**
1. Check API key is correct
2. Check domain is verified
3. Check email format is valid
4. Check Resend dashboard for error logs

---

## 🎯 Production Deployment

### Vercel/Netlify Environment Variables

1. **Go to your hosting dashboard**
2. **Add environment variable:**
   - Key: `VITE_RESEND_API_KEY`
   - Value: `re_your_api_key_here`
3. **Redeploy the app**

### GitHub Actions Secrets

If using GitHub Actions:

```bash
# Add secret to GitHub repo
# Settings > Secrets > Actions > New repository secret
# Name: VITE_RESEND_API_KEY
# Value: re_your_api_key_here
```

---

## 📊 Monitor Email Delivery

### Resend Dashboard

1. **Go to:** https://resend.com/emails
2. **View:**
   - Sent emails
   - Delivery status
   - Open rates
   - Click rates
   - Bounce rates

### Email Logs

Check console logs in development:

```javascript
console.log('📧 Email sent:', {
  to: recipientEmail,
  subject: emailSubject,
  status: 'success'
});
```

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies (if needed)
npm install resend

# 2. Add API key to .env
echo "VITE_RESEND_API_KEY=re_your_key_here" >> .env

# 3. Restart dev server
npm run dev

# 4. Test email
# - Sign up with a new account
# - Check your email inbox
```

---

## 📝 Email Best Practices

### 1. Use Professional "From" Address
```typescript
from: 'NeighbourFriendly <noreply@neighbourfriendly.in>'
```

### 2. Add Reply-To
```typescript
replyTo: 'support@neighbourfriendly.in'
```

### 3. Include Unsubscribe Link
```html
<a href="{{unsubscribe_url}}">Unsubscribe</a>
```

### 4. Test Before Sending
- Always test emails in development
- Check spam score
- Test on multiple email clients

---

## 🔐 Security

### Keep API Keys Secret

```bash
# Never commit .env file
# Already in .gitignore:
.env
.env.local
.env.production
```

### Use Environment Variables

```typescript
// ✅ Good
const apiKey = import.meta.env.VITE_RESEND_API_KEY;

// ❌ Bad
const apiKey = 're_hardcoded_key';
```

---

## 📞 Support

### Resend Support
- Email: support@resend.com
- Docs: https://resend.com/docs
- Discord: https://resend.com/discord

### NFRR Support
- Check logs in browser console
- Check Resend dashboard for delivery status
- Contact: sheriefshakeeb313@gmail.com

---

## ✅ Checklist

- [ ] Created Resend account
- [ ] Generated API key
- [ ] Added key to `.env` file
- [ ] Verified domain in Resend
- [ ] Added DNS records
- [ ] Restarted dev server
- [ ] Tested welcome email
- [ ] Tested booking emails
- [ ] Added to production environment
- [ ] Monitored delivery in dashboard

---

**Last Updated:** October 29, 2025  
**Status:** Ready to configure! 📧
