# Password Reset Email Troubleshooting Guide

## Issue: Password reset emails are not being sent to users

### Step 1: Check Supabase Email Settings

1. **Go to your Supabase Dashboard**
   - Navigate to: https://app.supabase.com/project/YOUR_PROJECT_ID

2. **Check Authentication Settings**
   - Go to `Authentication` → `Settings` → `Email Templates`
   - Verify that the "Reset Password" template is enabled
   - Check the template content and ensure it's properly configured

3. **Verify Email Provider**
   - Go to `Project Settings` → `Authentication` → `SMTP Settings`
   - By default, Supabase uses their built-in email service (limited to 3 emails/hour in free tier)
   - For production, you should configure a custom SMTP provider (SendGrid, AWS SES, etc.)

### Step 2: Check Site URL Configuration

1. **Go to Authentication Settings**
   - Navigate to `Authentication` → `URL Configuration`
   - Ensure your site URL is correctly set (e.g., `http://localhost:5173` for development)
   - Add your production URL when deploying

2. **Add Redirect URLs**
   - In the same section, add these to "Redirect URLs":
     - `http://localhost:5173/reset-password`
     - `https://yourdomain.com/reset-password` (for production)

### Step 3: Check Email Rate Limits

**Free Tier Limitations:**
- Supabase free tier has a limit of **3 emails per hour**
- If you've exceeded this, emails will be queued or dropped
- Solution: Wait an hour or upgrade to a paid plan

### Step 4: Check Spam Folder

- Password reset emails often end up in spam
- Check the user's spam/junk folder
- For production, use a verified SMTP provider to improve deliverability

### Step 5: Test with Console Logs

Add this to your `Login.tsx` to debug:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... existing code ...
  
  else if (mode === 'forgot') {
    console.log('Attempting password reset for:', formData.email);
    const { error } = await resetPassword(formData.email);
    console.log('Reset password result:', { error });
    if (error) {
      console.error('Reset password error:', error);
      setError(error.message);
    } else {
      showToast.success('Password reset link sent to your email!');
      setMode('login');
    }
  }
};
```

### Step 6: Verify Email Template Variables

In Supabase Dashboard → Authentication → Email Templates → Reset Password:

Make sure the template includes:
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

The `{{ .ConfirmationURL }}` variable is crucial for the reset link.

### Step 7: Check Supabase Logs

1. Go to `Logs` → `Auth Logs` in your Supabase dashboard
2. Look for password reset attempts
3. Check for any error messages

### Step 8: Common Issues & Solutions

**Issue**: "Email not sent"
- **Solution**: Check if the email exists in your database
- Supabase won't send reset emails to non-existent users (security feature)

**Issue**: "Invalid redirect URL"
- **Solution**: Ensure `/reset-password` is added to allowed redirect URLs

**Issue**: "SMTP configuration error"
- **Solution**: If using custom SMTP, verify credentials are correct

### Step 9: Production Setup (Recommended)

For reliable email delivery in production:

1. **Use a dedicated email service**:
   - SendGrid (recommended, 100 emails/day free)
   - AWS SES
   - Mailgun
   - Postmark

2. **Configure SMTP in Supabase**:
   - Go to `Project Settings` → `Authentication` → `SMTP Settings`
   - Enter your SMTP credentials
   - Test the connection

### Step 10: Alternative Approach (If emails still don't work)

If you continue to have issues, you can implement a custom password reset flow:

1. Create a password reset request table
2. Generate a unique token
3. Send email using a third-party service (SendGrid, etc.)
4. Verify token and allow password update

---

## Quick Checklist

- [ ] Email template is enabled in Supabase
- [ ] Site URL is correctly configured
- [ ] Redirect URL includes `/reset-password`
- [ ] Not exceeding email rate limits (3/hour on free tier)
- [ ] Email exists in the database
- [ ] Checked spam folder
- [ ] Reviewed Supabase auth logs
- [ ] For production: Custom SMTP configured

## Testing Steps

1. Open browser console (F12)
2. Go to login page
3. Click "Forgot Password"
4. Enter a valid email address
5. Check console for any errors
6. Check Supabase dashboard logs
7. Check email inbox (and spam folder)
8. Wait a few minutes (emails can be delayed)

---

**Note**: The code implementation is correct. The issue is likely with Supabase configuration or email service limitations.
