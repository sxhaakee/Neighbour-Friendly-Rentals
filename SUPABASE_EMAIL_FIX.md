# 🔧 Fix Supabase Confirmation Emails

## 🔴 Problem

**Issue 1:** Supabase not sending confirmation emails when users sign up  
**Issue 2:** Users can't sign in after signup

**Root Cause:** Email confirmation is required but emails aren't being sent

---

## ✅ Solution: Configure Supabase Email Settings

### Step 1: Check Email Confirmation Settings

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project: `epolbovqrclrfozfgwvc`

2. **Navigate to Authentication → Settings**
   - Left sidebar → Authentication → Settings

3. **Check "Email Confirmation" setting**
   
   **Option A: Disable Email Confirmation (Quick Fix)**
   - Scroll to "Email Confirmation"
   - **Toggle OFF** "Enable email confirmations"
   - Click "Save"
   
   **Result:** Users can sign in immediately without confirming email
   
   **Option B: Enable Email Confirmation (Recommended)**
   - Keep "Enable email confirmations" **ON**
   - Configure email provider (see Step 2)

---

### Step 2: Configure Email Provider (If Using Confirmation)

**Supabase has 3 email options:**

#### Option 1: Use Supabase SMTP (Default - May Not Work)

**Problem:** Default SMTP often doesn't work or goes to spam

**Check if it's working:**
1. Authentication → Settings → SMTP Settings
2. If using default → Emails may not send

#### Option 2: Use Custom SMTP (Recommended)

**Use a reliable SMTP provider:**

**A. Using Gmail:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: your-email@gmail.com
SMTP Password: [App Password - not your regular password]
Sender Email: your-email@gmail.com
Sender Name: NeighbourFriendly Rentals
```

**Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Create app password for "Mail"
3. Copy the 16-character password
4. Use in Supabase SMTP settings

**B. Using SendGrid (Free 100 emails/day):**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [Your SendGrid API Key]
Sender Email: noreply@neighbourfriendly.in
Sender Name: NeighbourFriendly Rentals
```

**C. Using Resend (Previous provider):**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP Username: resend
SMTP Password: [Your Resend API Key]
Sender Email: noreply@neighbourfriendly.in
Sender Name: NeighbourFriendly Rentals
```

**D. Using Brevo (Formerly Sendinblue) - ✅ CHOSEN SOLUTION:**
```
SMTP Host: smtp-relay.brevo.com
SMTP Port: 587
SMTP Username: [Your Brevo Login Email]
SMTP Password: [Your Brevo SMTP Key - NOT your login password]
Sender Email: [Your Verified Sender Email]
Sender Name: NeighbourFriendly Rentals
```

**To get your Brevo SMTP Key:**
1. Login to Brevo
2. Click your name (top right) -> SMTP & API
3. Click "SMTP" tab -> "Generate a new SMTP key"


#### Option 3: Disable Email Confirmation (Easiest)

**If you don't need email confirmation:**

1. Authentication → Settings
2. **Toggle OFF** "Enable email confirmations"
3. Users can sign in immediately

### Step 1.5: Configure Redirect URLs (CRITICAL)

**Important:** After users click the link in the email, where should they go?

1. **Navigate to Authentication -> URL Configuration**
2. **Site URL:** Set this to your homepage (e.g., `https://neighbourfriendly.in` or `http://localhost:5173`)
3. **Redirect URLs:** Add any specific landing pages if needed (e.g., `https://neighbourfriendly.in/dashboard`).
   - For Invite User flow, it will default to Site URL unless a specific redirect is provided in the code.
   - **Recommended:** Ensure `https://neighbourfriendly.in` is listed here.

**How it works:**  
User clicks `{{ .ConfirmationURL }}` → Supabase Verifies Token → Redirects to **Site URL**.

---


### Step 3: Update Email Templates (Optional)

**Customize confirmation email:**

1. Authentication → Email Templates
2. Click "Confirm signup"
3. Edit template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Signup</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #374151;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); padding: 40px; text-align: center;">
          
          <!-- Header/Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #d97706;">NeighbourFriendly</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #111827;">Welcome to the Neighbourhood! 🏡</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                We're thrilled to have you join us! You're just one step away from connecting with your community. 
                Please confirm your email address to get started.
              </p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #d97706; text-decoration: none; border-radius: 8px; transition: background-color 0.2s;">
                Confirm My Account
              </a>
            </td>
          </tr>

          <!-- Link fallback -->
          <tr>
            <td align="center" style="padding-bottom: 32px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                Or paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #d97706; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">
                Cheers,<br>The NeighbourFriendly Team
              </p>
              <p style="margin: 0; font-size: 12px; color: #d1d5db;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

4. Click "Invite User"
5. Edit template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Invited</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden; text-align: center;">
          
          <!-- Premium Gold Header Stripe -->
          <tr>
            <td style="background: linear-gradient(90deg, #d97706 0%, #fbbf24 100%); height: 8px; width: 100%;"></td>
          </tr>

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 40px 0 24px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em; color: #1f2937;">Neighbour<span style="color: #d97706;">Friendly</span></h1>
            </td>
          </tr>

          <!-- Hero Image / Icon equivalent -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="background-color: #fffbeb; width: 80px; height: 80px; border-radius: 50%; display: table; margin: 0 auto;">
                <span style="display: table-cell; vertical-align: middle; font-size: 40px;">🔑</span>
              </div>
            </td>
          </tr>

          <!-- Main Headline -->
          <tr>
            <td align="center" style="padding: 0 48px;">
              <h2 style="margin: 0 0 16px 0; font-size: 26px; font-weight: 800; color: #111827; line-height: 1.2;">
                You've Been Selected to Join the Neighbourhood.
              </h2>
            </td>
          </tr>

          <!-- Persuasive Copy -->
          <tr>
            <td align="center" style="padding: 0 48px 32px;">
              <p style="margin: 0 0 24px 0; font-size: 18px; line-height: 1.6; color: #4b5563;">
                 Congratulations! Someone who trusts you thinks you belong here.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: left;">
                <strong>NeighbourFriendly</strong> isn't just another marketplace. It's an exclusive community where you can:
              </p>
              <ul style="text-align: left; padding: 0 0 0 20px; margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.8; list-style-type: none;">
                <li style="margin-bottom: 8px;">✅ <strong>Rent Luxury Gear</strong> for a fraction of the cost</li>
                <li style="margin-bottom: 8px;">🤝 <strong>Connect with Verified Neighbors</strong> you can trust</li>
                <li style="margin: 0;">💰 <strong>Turn Your Own Items into Income</strong> effortlessly</li>
              </ul>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                Your private invitation is waiting. Don't let your spot go to someone else.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(90deg, #d97706 0%, #fbbf24 100%);">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 48px; font-size: 18px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; font-family: sans-serif; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                      Claim My Invite &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback Link -->
          <tr>
            <td align="center" style="padding: 0 48px 40px; border-bottom: 1px solid #f3f4f6;">
              <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                Or copy this secure link:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #d97706; text-decoration: none;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #6b7280;">
                NeighbourFriendly Rentals
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Premium Community Rental Platform<br>
                Sent with ❤️ from your local neighbourhood.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Variables available:**
- `{{ .ConfirmationURL }}` - Confirmation link
- `{{ .Token }}` - Confirmation token
- `{{ .SiteURL }}` - Your site URL

---

## 🎯 Recommended Setup

### For Development (Quick Start):

**Disable email confirmation:**
```
1. Supabase Dashboard → Authentication → Settings
2. Toggle OFF "Enable email confirmations"
3. Save
```

**Result:**
- ✅ Users can sign in immediately
- ✅ No confirmation email needed
- ✅ Still get welcome email from Resend
- ✅ Fast testing

---

### For Production (Secure):

**Enable email confirmation with Resend SMTP:**

```
1. Authentication → Settings → SMTP Settings
2. Enable Custom SMTP
3. Fill in:
   - Host: smtp.resend.com
   - Port: 587
   - Username: resend
   - Password: re_eGVhpxbn_9jDbf4nEBdia2XZ1PyPRokTo
   - Sender: noreply@neighbourfriendly.in
   - Name: NeighbourFriendly Rentals
4. Save
5. Test by signing up
```

**Result:**
- ✅ Secure (email verification required)
- ✅ Professional emails
- ✅ Uses your Resend account
- ✅ Reliable delivery

---

## 🧪 Testing

### Test 1: Disable Confirmation (Quick Test)

1. **Disable email confirmation** in Supabase
2. **Sign up** with new email
3. **Should:** Redirect to dashboard immediately
4. **Check console:** "✅ Welcome email sent to new user"
5. **Check Resend:** Welcome email delivered

### Test 2: Enable Confirmation (Production Test)

1. **Enable email confirmation** in Supabase
2. **Configure SMTP** (Resend recommended)
3. **Sign up** with new email
4. **Check inbox:** Confirmation email from Supabase
5. **Click link** in email
6. **Should:** Redirect to dashboard
7. **Check Resend:** Welcome email delivered

---

## 🔍 Troubleshooting

### Problem: No confirmation email received

**Check:**
1. Spam/junk folder
2. SMTP settings in Supabase
3. Sender email verified in SMTP provider
4. Email confirmation enabled in Supabase

**Solutions:**
- Use custom SMTP (not default)
- Verify sender email in SMTP provider
- Check SMTP credentials are correct
- Test with different email address

---

### Problem: Can't sign in after signup

**Cause:** Email confirmation required but not completed

**Solutions:**

**Option A: Disable confirmation (development)**
```
Supabase → Authentication → Settings
Toggle OFF "Enable email confirmations"
```

**Option B: Confirm email (production)**
```
1. Check inbox for confirmation email
2. Click confirmation link
3. Then sign in
```

**Option C: Manually confirm in Supabase**
```
1. Supabase → Authentication → Users
2. Find the user
3. Click "..." → Confirm email
4. User can now sign in
```

---

### Problem: Confirmation email goes to spam

**Solutions:**

1. **Use custom SMTP** (not default Supabase)
2. **Verify sender domain** in SMTP provider
3. **Add SPF/DKIM records** to your domain
4. **Use professional email** (not gmail)
5. **Customize email template** (less spammy)

---

## 📊 Email Flow Comparison

### With Email Confirmation:

```
User Signs Up
    ↓
Supabase sends confirmation email
    ↓
User clicks link in email
    ↓
User confirmed ✅
    ↓
User signs in
    ↓
Resend sends welcome email
```

### Without Email Confirmation:

```
User Signs Up
    ↓
User signed in immediately ✅
    ↓
Resend sends welcome email
```

---

## 🎯 Quick Fix (Choose One)

### Option 1: Disable Confirmation (Fastest)

```bash
# No code changes needed!
# Just toggle in Supabase dashboard:
Authentication → Settings → Email Confirmation → OFF
```

**Pros:**
- ✅ Works immediately
- ✅ No SMTP setup needed
- ✅ Fast user onboarding

**Cons:**
- ⚠️ Less secure (no email verification)
- ⚠️ Fake emails can sign up

---

### Option 2: Use Resend SMTP (Recommended)

```bash
# In Supabase dashboard:
Authentication → Settings → SMTP Settings

Host: smtp.resend.com
Port: 587
Username: resend
Password: re_eGVhpxbn_9jDbf4nEBdia2XZ1PyPRokTo
Sender: noreply@neighbourfriendly.in
```

**Pros:**
- ✅ Secure (email verification)
- ✅ Professional emails
- ✅ Reliable delivery
- ✅ Uses your Resend account

**Cons:**
- ⚠️ Requires domain verification in Resend
- ⚠️ Extra setup step

---

## ✅ Recommended Action

**For immediate testing:**
1. Disable email confirmation in Supabase
2. Test signup/signin flow
3. Verify welcome emails work

**For production:**
1. Enable email confirmation
2. Configure Resend SMTP
3. Verify domain in Resend
4. Test complete flow

---

## 📞 Support

**Supabase Dashboard:**
https://supabase.com/dashboard/project/epolbovqrclrfozfgwvc

**Settings Path:**
Authentication → Settings → Email Confirmation

**SMTP Settings:**
Authentication → Settings → SMTP Settings

**Email Templates:**
Authentication → Email Templates

---

**Last Updated:** November 1, 2024, 12:50 PM IST  
**Status:** ⚠️ Needs Configuration in Supabase Dashboard
