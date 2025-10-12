# 🔧 Google OAuth Fix

## Error: "Unsupported provider: provider is not enabled"

This error occurs because Google OAuth is not yet configured in your Supabase project.

## Quick Fix Steps:

### 1. Enable Google Provider in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it **ON** (Enable)
5. You'll see fields for:
   - Client ID
   - Client Secret

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure OAuth consent screen first:
   - User Type: **External**
   - App name: **NFRR Rental Marketplace**
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: email, profile, openid
6. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **NFRR Web Client**
   - Authorized redirect URIs:
     ```
     http://localhost:5173
     https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
     ```
     (Replace YOUR-PROJECT-ID with your actual Supabase project ID)

7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### 3. Configure in Supabase

1. Go back to Supabase → **Authentication** → **Providers** → **Google**
2. Paste:
   - **Client ID** (from Google)
   - **Client Secret** (from Google)
3. The **Redirect URL** will be shown - copy it
4. Go back to Google Cloud Console
5. Add this redirect URL to your OAuth credentials if not already added
6. Click **Save** in Supabase

### 4. Test

1. Restart your dev server: `npm run dev`
2. Go to login page
3. Click "Continue with Google"
4. Should now work!

## Alternative: Disable Google OAuth Temporarily

If you want to skip Google OAuth for now:

1. **Remove the Google Sign-in button** from Login page
2. Edit `src/pages/Login.tsx`
3. Comment out or remove the Google button section (lines ~248-269)

## Important Notes:

- Google OAuth requires HTTPS in production
- For local development, `http://localhost:5173` is allowed
- Make sure to add your production domain to authorized redirect URIs before deploying

## Need Help?

Check the full setup guide in `DEPLOYMENT_GUIDE.md` → "Google OAuth Setup" section.
