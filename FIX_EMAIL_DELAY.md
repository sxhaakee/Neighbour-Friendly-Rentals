# Resolving Verification Email Issues

If your users are not receiving verification emails or experiencing long delays, it is because your Supabase project is configured to use a **Custom SMTP (Resend)** which might be misconfigured or running into limits/delays.

## 🚨 IMMEDIATE FIX: Enable Built-in Email Service

To instantly fix the "not sending verification email" issue, revert to Supabase's built-in email service for Auth emails.

1.  **Log in to Supabase Dashboard**
    *   Navigate to your project: `https://supabase.com/dashboard/project/epolbovqrclrfozfgwvc`
    
2.  **Go to Auth Settings**
    *   Click on **Authentication** (icon in left sidebar)
    *   Click on **SMTP Settings** (under Configuration)

3.  **Disable Custom SMTP**
    *   Find the toggle **Enable Custom SMTP**
    *   **Turn it OFF** (Switch to disabled)
    *   This will immediately revert to using `noreply@mail.app.supabase.io` which is instant and requires no configuration.

4.  **Verify Email Templates**
    *   Go to **Authentication -> Email Templates**
    *   Ensure **Confirm Your Signup** is enabled.
    *   Ensure the template body contains `{{ .ConfirmationURL }}`.

## 🔄 Verify Client Side Changes

I have already updated the code to help with this:

1.  **Added `resendVerificationEmail`**: Updated `AuthContext` to allow resending verification emails.
2.  **Updated Login Page**: If a user tries to login but receives "Email not confirmed", a popup will now appear with a **"Resend Link"** button.
3.  **Better Debugging**: Added detailed console logs to track if signup is succeeding.

## 📧 About Transactional Emails (Welcome, Booking)

Your transactional emails (Welcome, Booking Confirmation, etc.) are sent via the **`send-email` Edge Function** which uses Resend API. 

*   **This is SEPARATE from Auth Verification emails.**
*   Switching Auth SMTP back to Supabase default (Step 3 above) **WILL NOT** break your transactional emails.
*   The `send-email` function will continue using your Resend API key to send nice HTML emails for bookings/welcomes.

**Summary**: 
- **Auth Verification**: Use Supabase Default (Disable Custom SMTP in Dashboard).
- **Transactional**: Continue using Edge Function (Resend).
