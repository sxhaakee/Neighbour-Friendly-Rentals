# Fix Google Sign-in Display Name - DETAILED GUIDE

## Problem
Google Sign-in shows "epolbovqrclrfozfgwvc.supabase.co" instead of "NeighbourFriendly Rentals"

## ⚠️ IMPORTANT
This CANNOT be fixed in code. You MUST update Google Cloud Console settings manually.

---

## 🚀 STEP-BY-STEP SOLUTION

### Step 1: Update Supabase Site URL (5 minutes)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Login with your account

2. **Select Your Project:**
   - Click on your "NeighbourFriendly" project

3. **Go to Settings:**
   - Click "Settings" (gear icon) in left sidebar
   - Click "General"

4. **Update Site URL:**
   - Find "Site URL" field
   - Change from: `https://epolbovqrclrfozfgwvc.supabase.co`
   - Change to: `https://neighbourfriendly.in`
   - Click "Save"

5. **Update Additional URLs:**
   - Find "Redirect URLs" section
   - Add: `https://neighbourfriendly.in/**`
   - Add: `https://neighbourfriendly.in/auth/callback`
   - Click "Save"

---

### Step 2: Update Google Cloud Console OAuth (10 minutes)

#### Part A: OAuth Consent Screen

1. **Open Google Cloud Console:**
   - Go to: https://console.cloud.google.com
   - Login with your Google account

2. **Select Your Project:**
   - Click project dropdown at top
   - Select your project (the one linked to Supabase)

3. **Go to OAuth Consent Screen:**
   - Click hamburger menu (☰) top left
   - Go to: **APIs & Services** → **OAuth consent screen**

4. **Edit App Information:**
   Click "EDIT APP" button, then update:
   
   **App Information:**
   - App name: `NeighbourFriendly Rentals`
   - User support email: `support@neighbourfriendly.in`
   - App logo: (Upload your logo - optional)

   **App Domain:**
   - Application home page: `https://neighbourfriendly.in`
   - Application privacy policy: `https://neighbourfriendly.in/privacy`
   - Application terms of service: `https://neighbourfriendly.in/terms`

   **Authorized domains:**
   - Add: `neighbourfriendly.in`
   - Add: `supabase.co` (keep this)

   **Developer contact information:**
   - Email: `support@neighbourfriendly.in`

5. **Click "SAVE AND CONTINUE"** through all steps

#### Part B: OAuth Credentials

1. **Go to Credentials:**
   - In Google Cloud Console
   - Go to: **APIs & Services** → **Credentials**

2. **Find Your OAuth 2.0 Client ID:**
   - Look for "OAuth 2.0 Client IDs" section
   - Click on your client ID (usually named "Web client")

3. **Update Authorized Redirect URIs:**
   - Find "Authorized redirect URIs" section
   - Click "ADD URI"
   - Add: `https://neighbourfriendly.in/auth/callback`
   - Add: `https://neighbourfriendly.in/auth/v1/callback`
   - **Keep existing Supabase URIs** (don't delete them)
   - Click "SAVE"

---

### Step 3: Update Supabase Auth Settings

1. **Back to Supabase Dashboard:**
   - Go to your project
   - Click "Authentication" in left sidebar
   - Click "Providers"

2. **Update Google Provider:**
   - Find "Google" provider
   - Click to expand
   - Verify "Client ID" and "Client Secret" are correct
   - If not, copy from Google Cloud Console → Credentials
   - Click "Save"

---

### Step 4: Clear Cache & Test (2 minutes)

1. **Clear Browser Cache:**
   - Chrome: `Cmd + Shift + Delete` (Mac) or `Ctrl + Shift + Delete` (Windows)
   - Select "Cached images and files"
   - Select "Cookies and other site data"
   - Click "Clear data"

2. **Test Sign-in:**
   - Go to: https://neighbourfriendly.in
   - Click "Sign in with Google"
   - Should now show: "Sign in to NeighbourFriendly Rentals"
   - NOT: "Sign in to epolbovqrclrfozfgwvc.supabase.co"

---

## 🐛 Troubleshooting

### Still Showing Project ID?

**Try these:**

1. **Wait 5-10 minutes:**
   - Google caches OAuth settings
   - Changes take time to propagate

2. **Use Incognito Mode:**
   - Open incognito/private window
   - Try signing in
   - Should show new name

3. **Check Google Cloud Console:**
   - Go back to OAuth consent screen
   - Verify "App name" is saved correctly
   - Should say "NeighbourFriendly Rentals"

4. **Verify Supabase Settings:**
   - Check Site URL is `https://neighbourfriendly.in`
   - Check Redirect URLs include your domain

5. **Check Browser Console:**
   - Press F12
   - Look for errors
   - Share errors if any

---

## 📋 Checklist

Use this to verify everything is done:

### Supabase:
- [ ] Site URL updated to `https://neighbourfriendly.in`
- [ ] Redirect URLs include `https://neighbourfriendly.in/**`
- [ ] Google provider is enabled
- [ ] Client ID and Secret are correct

### Google Cloud Console:
- [ ] App name is "NeighbourFriendly Rentals"
- [ ] Home page is `https://neighbourfriendly.in`
- [ ] Authorized domain includes `neighbourfriendly.in`
- [ ] Redirect URIs include your domain
- [ ] Changes are saved

### Testing:
- [ ] Browser cache cleared
- [ ] Tested in incognito mode
- [ ] Sign-in shows correct name

---

## ⏰ Timeline

- **Immediate:** Supabase changes (5 min)
- **5-10 minutes:** Google Cloud changes propagate
- **Up to 24 hours:** Full cache clear across all Google servers

---

## 🎯 Expected Result

**Before:**
```
Sign in to epolbovqrclrfozfgwvc.supabase.co
```

**After:**
```
Sign in to NeighbourFriendly Rentals
```

---

## 📞 Need Help?

If still not working after 24 hours:

1. **Share Screenshots:**
   - Google OAuth consent screen
   - Supabase Site URL settings
   - Sign-in page showing issue

2. **Check These:**
   - Is your domain verified in Google Search Console?
   - Are there multiple OAuth clients? (use the right one)
   - Is the app in "Testing" mode? (should be "Production")

---

**This is a Google Cloud Console configuration issue, not a code issue. Follow these steps carefully!** 🎯
