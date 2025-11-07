# Fix Google Sign-in Display Name

## Problem
Google Sign-in shows "epolbovqrclrfozfgwvc.supabase.co" instead of "NeighbourFriendly Rentals"

## Solution

### Step 1: Update Supabase Site URL
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Update **Site URL** to: `https://neighbourfriendly.in`
5. Click **Save**

### Step 2: Update Google Cloud Console
1. Go to https://console.cloud.google.com
2. Select your project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Update the following:
   - **Application name**: NeighbourFriendly Rentals
   - **Application home page**: https://neighbourfriendly.in
   - **Application privacy policy**: https://neighbourfriendly.in/privacy
   - **Application terms of service**: https://neighbourfriendly.in/terms
5. Click **Save**

### Step 3: Update OAuth Redirect URIs
1. In Google Cloud Console
2. Go to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - `https://neighbourfriendly.in/auth/callback`
   - Keep the existing Supabase URL as backup
5. Click **Save**

### Step 4: Clear Browser Cache
1. Clear your browser cache
2. Try signing in again
3. Should now show "NeighbourFriendly Rentals"

## Result
✅ Google Sign-in will show "NeighbourFriendly Rentals" instead of project ID
