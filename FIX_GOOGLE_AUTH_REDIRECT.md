# 🚨 FIX GOOGLE AUTH REDIRECT ISSUE

## ❌ THE PROBLEM

When users sign in with Google, they're being redirected to `localhost:3000` instead of your production domain `neighbourfriendly.in`.

**Root Cause**: Supabase Auth redirect URLs are not configured for your production domain.

---

## ✅ THE SOLUTION

You need to update redirect URLs in **TWO PLACES**:

### **1. Supabase Dashboard (CRITICAL!)**
### **2. Google Cloud Console**

---

## 🔧 FIX #1: SUPABASE REDIRECT URLS

### **Step 1: Go to Supabase Dashboard**

1. Open: https://supabase.com/dashboard
2. Select your project: **NFRR**
3. Go to: **Authentication** (left sidebar)
4. Click: **URL Configuration**

### **Step 2: Update Site URL**

Find: **Site URL**
```
Current: http://localhost:3000
Change to: https://neighbourfriendly.in
```

### **Step 3: Update Redirect URLs**

Find: **Redirect URLs**

**Add these URLs** (one per line):
```
https://neighbourfriendly.in
https://neighbourfriendly.in/
https://neighbourfriendly.in/**
https://www.neighbourfriendly.in
https://www.neighbourfriendly.in/
https://www.neighbourfriendly.in/**
```

**Keep for development:**
```
http://localhost:3000
http://localhost:3000/
http://localhost:3000/**
```

### **Step 4: Save Changes**

Click: **Save**

---

## 🔧 FIX #2: GOOGLE CLOUD CONSOLE

### **Step 1: Go to Google Cloud Console**

1. Open: https://console.cloud.google.com
2. Select your project (the one with OAuth credentials)
3. Go to: **APIs & Services** → **Credentials**

### **Step 2: Find OAuth 2.0 Client**

1. Find your OAuth 2.0 Client ID
2. Click the **Edit** icon (pencil)

### **Step 3: Update Authorized Redirect URIs**

Find: **Authorized redirect URIs**

**Add these URIs:**
```
https://neighbourfriendly.in/auth/callback
https://www.neighbourfriendly.in/auth/callback
https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
```

**Replace `[YOUR-PROJECT-ID]`** with your actual Supabase project ID.

To find your Supabase project ID:
- Go to Supabase Dashboard
- Look at the URL: `https://supabase.com/dashboard/project/[PROJECT-ID]`
- Or check your `VITE_SUPABASE_URL` environment variable

**Example:**
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

**Keep for development:**
```
http://localhost:3000/auth/callback
```

### **Step 4: Save Changes**

Click: **Save**

---

## 🔧 FIX #3: VERIFY ENVIRONMENT VARIABLES

Check that your production environment has correct variables:

### **In Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard
2. Select: NFRR project
3. Go to: **Settings** → **Environment Variables**

**Verify these exist:**
```
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

**If missing, add them and redeploy!**

---

## ✅ VERIFICATION STEPS

### **After Making Changes:**

1. **Wait 2-3 minutes** for changes to propagate

2. **Clear browser cache:**
   - Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
   - Select: "Cached images and files"
   - Click: "Clear data"

3. **Test Google Sign In:**
   - Go to: https://neighbourfriendly.in
   - Click: "Sign In"
   - Click: "Continue with Google"
   - Should redirect to: `https://neighbourfriendly.in` (NOT localhost!)

4. **Check URL after login:**
   - Should be: `https://neighbourfriendly.in/#access_token=...`
   - NOT: `http://localhost:3000/#access_token=...`

---

## 🔍 DETAILED EXPLANATION

### **How OAuth Redirect Works:**

```
1. User clicks "Sign in with Google"
   ↓
2. Browser redirects to Google OAuth
   ↓
3. User authorizes app
   ↓
4. Google redirects back with auth token
   ↓
5. Redirect URL must match configured URLs!
   ↓
6. App receives token and logs user in
```

### **Why It Was Redirecting to Localhost:**

1. **Supabase Site URL** was set to `http://localhost:3000`
2. **Google OAuth redirect** was only configured for localhost
3. When user logged in from production, it used the **Site URL** from Supabase
4. This caused redirect to localhost instead of production domain

### **The Fix:**

1. **Update Supabase Site URL** to production domain
2. **Add production URLs** to allowed redirects
3. **Update Google OAuth** to allow production redirects
4. Now redirects work for both development AND production!

---

## 🚨 COMMON ISSUES & FIXES

### **Issue 1: "Redirect URL not allowed"**

**Error Message:**
```
Invalid redirect URL. The redirect URL must be in the list of allowed URLs.
```

**Fix:**
- Go to Supabase → Authentication → URL Configuration
- Add your production URL to "Redirect URLs"
- Make sure to include wildcards: `https://neighbourfriendly.in/**`

### **Issue 2: "OAuth Error: redirect_uri_mismatch"**

**Error Message:**
```
Error 400: redirect_uri_mismatch
```

**Fix:**
- Go to Google Cloud Console → Credentials
- Edit your OAuth 2.0 Client
- Add the exact redirect URI shown in the error
- Format: `https://[project-id].supabase.co/auth/v1/callback`

### **Issue 3: Still Redirecting to Localhost**

**Possible Causes:**
1. Browser cache not cleared
2. Changes not propagated yet
3. Wrong environment variables in Vercel

**Fix:**
1. Clear browser cache completely
2. Wait 5 minutes for changes to propagate
3. Verify environment variables in Vercel
4. Redeploy if needed

### **Issue 4: "Invalid OAuth Client"**

**Error Message:**
```
Invalid OAuth client
```

**Fix:**
- Check that your Google OAuth credentials are correct
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel
- Make sure OAuth client is enabled in Google Cloud Console

---

## 📋 COMPLETE CHECKLIST

### **Supabase Configuration:**
- [ ] Site URL changed to `https://neighbourfriendly.in`
- [ ] Added `https://neighbourfriendly.in/**` to Redirect URLs
- [ ] Added `https://www.neighbourfriendly.in/**` to Redirect URLs
- [ ] Kept localhost URLs for development
- [ ] Saved changes

### **Google Cloud Console:**
- [ ] Found OAuth 2.0 Client ID
- [ ] Added `https://neighbourfriendly.in/auth/callback`
- [ ] Added `https://www.neighbourfriendly.in/auth/callback`
- [ ] Added `https://[project-id].supabase.co/auth/v1/callback`
- [ ] Saved changes

### **Vercel Environment:**
- [ ] Verified `VITE_SUPABASE_URL` exists
- [ ] Verified `VITE_SUPABASE_ANON_KEY` exists
- [ ] Redeployed if variables were added/changed

### **Testing:**
- [ ] Cleared browser cache
- [ ] Waited 2-3 minutes
- [ ] Tested Google sign in
- [ ] Verified redirect to production domain
- [ ] Confirmed user logged in successfully

---

## 🎯 QUICK FIX SUMMARY

**Do these 3 things:**

1. **Supabase Dashboard:**
   - Authentication → URL Configuration
   - Site URL: `https://neighbourfriendly.in`
   - Redirect URLs: Add production URLs

2. **Google Cloud Console:**
   - APIs & Services → Credentials
   - Edit OAuth Client
   - Add production redirect URIs

3. **Test:**
   - Clear cache
   - Try Google sign in
   - Should work!

---

## 📞 NEED HELP?

### **If Still Not Working:**

1. **Check Supabase Logs:**
   - Supabase Dashboard → Logs
   - Look for authentication errors

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

3. **Verify URLs Match Exactly:**
   - Supabase Site URL
   - Google OAuth redirect URI
   - Vercel domain
   - All must match exactly!

---

## ✅ EXPECTED RESULT

**After fixing:**

1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. User authorizes
4. **Redirects back to: `https://neighbourfriendly.in`** ✅
5. User is logged in
6. Dashboard loads correctly

**No more localhost redirects!** 🎉

---

## 🚀 ADDITIONAL RECOMMENDATIONS

### **1. Add Error Handling**

Update your auth code to show better errors:

```typescript
const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to sign in with Google:', error);
    throw error;
  }
};
```

### **2. Add Development/Production Check**

```typescript
const getRedirectUrl = () => {
  const isDevelopment = window.location.hostname === 'localhost';
  return isDevelopment 
    ? 'http://localhost:3000/'
    : 'https://neighbourfriendly.in/';
};

const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
      // ...
    },
  });
};
```

### **3. Test Both Environments**

Always test:
- ✅ Development (localhost:3000)
- ✅ Production (neighbourfriendly.in)

---

## 📝 NOTES

- Changes take 2-3 minutes to propagate
- Always clear browser cache after changes
- Keep localhost URLs for development
- Use wildcards (`**`) for flexible matching
- Test in incognito mode to avoid cache issues

---

**This will fix your Google Auth redirect issue completely!** 🎉

**Follow the steps in order and test after each change!**
