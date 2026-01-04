# 🔧 Checklist: Verify Brevo SMTP Configuration

You have authenticated your domain (`neighbourfriendly.in`) with Brevo. This is great!
Now you must ensure Supabase uses these **exact** settings to send Signup/Verification emails.

## 1. Supabase Dashboard Settings

Go to: **Project Settings** -> **Authentication** -> **SMTP Settings**

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Enable Custom SMTP** | ✅ **ON** | Must be enabled |
| **Sender Email** | `noreply@neighbourfriendly.in` | **MUST** be an email on your authenticated domain. Do not use `@gmail.com`. |
| **Sender Name** | `NeighbourFriendly Rentals` | Can be anything |
| **Host** | `smtp-relay.brevo.com` | |
| **Port** | `587` | |
| **Username** | **Your Login Email** | The email you use to login to Brevo (e.g. `shakeeb...`) |
| **Password** | **SMTP Key** | **NOT** your login password. **NOT** your API Key (`xkeysib-...`). It must be the **SMTP Master Password** found in Brevo -> SMTP & API -> SMTP Tab. |

## 2. Common Mistakes ⚠️

### A. Using API Key instead of SMTP Key
- **API Key** starts with `xkeysib-...` (Used for Edge Functions - We set this up correctly ✅)
- **SMTP Key** is different. If you haven't generated one:
  1. Go to Brevo -> SMTP & API -> **SMTP Tab** (not API keys tab)
  2. Click **Generate a new SMTP key**
  3. Use *that* key as the password in Supabase.

### B. Wrong Sender Email
- You **cannot** use `admin@neighbourfriendly.in` if you haven't created that sender in Brevo.
- Go to **Brevo -> Senders, Domains & IPs -> Senders**.
- Ensure `noreply@neighbourfriendly.in` (or whatever you put in Supabase) is listed there and marked as **Verified**.

### C. Rate Limits
- If you requested too many emails recently, Supabase might throttle you. Check **Auth -> Rate Limits** in Supabase settings if emails don't arrive.

## 3. Testing

1. **Sign Up** with a *new* email address (e.g. `test+1@example.com`).
   - If you get the confirmation email → **Success!** 🎉
   - If not, check Supabase **Logs -> Auth** for errors.
2. **Reset Password**
   - Click "Forgot Password" on login screen.
   - This now uses our custom Edge Function, so it should work 100% via API Key.
