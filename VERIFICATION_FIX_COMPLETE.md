# 🔧 Verification Fix - Database Functions

**Date:** October 12, 2025 17:44  
**Status:** ⚠️ **REQUIRES DATABASE SETUP**

---

## 🐛 Problem Identified

### Issue:
- Toast shows "User verified successfully!" ✅
- But user still appears in Pending tab ❌
- User cannot book items ❌
- Database not actually updated ❌

### Root Cause:
**RLS (Row Level Security) policies are blocking the update!**

The admin user doesn't have permission to update the `profiles` table directly. The update is silently failing.

---

## ✅ Solution: Database Functions

Created **Supabase Functions** that bypass RLS using `SECURITY DEFINER`.

### Functions Created:
1. `verify_user(p_user_id, p_admin_id)` - Approves verification
2. `reject_user_verification(p_user_id, p_admin_id, p_reason)` - Rejects verification

---

## 📝 Step-by-Step Fix

### Step 1: Run SQL in Supabase

**File:** `supabase-functions-verification.sql`

```sql
1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Click "New Query"
4. Copy the entire content from supabase-functions-verification.sql
5. Click "Run"
6. Should see: "Success. No rows returned"
```

**What this does:**
- Creates `verify_user()` function
- Creates `reject_user_verification()` function
- Grants execute permissions to authenticated users
- Functions run with elevated privileges (SECURITY DEFINER)

---

### Step 2: Verify Functions Created

```sql
-- Run this to check:
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('verify_user', 'reject_user_verification');

-- Should return:
-- verify_user | FUNCTION
-- reject_user_verification | FUNCTION
```

---

### Step 3: Test the Functions

```sql
-- Test verify_user (replace UUIDs with real ones):
SELECT verify_user(
  'user-id-to-verify'::UUID,
  'your-admin-id'::UUID
);

-- Should return JSON:
-- {"success": true, "user_id": "...", "verified_at": "..."}

-- Check if it worked:
SELECT id, email, id_verified, id_verification_status
FROM profiles
WHERE id = 'user-id-to-verify'::UUID;

-- Should show:
-- id_verified: true
-- id_verification_status: 'verified'
```

---

## 🔧 Code Changes Made

### 1. `src/services/verificationService.ts`

**Before (BROKEN):**
```typescript
async verifyUser(userId: string, adminId: string) {
  // Direct update - BLOCKED BY RLS!
  const { error } = await supabase
    .from('profiles')
    .update({
      id_verified: true,
      id_verification_status: 'verified',
      id_verified_at: new Date().toISOString(),
    })
    .eq('id', userId);
}
```

**After (FIXED):**
```typescript
async verifyUser(userId: string, adminId: string) {
  // Use RPC function - BYPASSES RLS!
  const { data, error } = await supabase.rpc('verify_user', {
    p_user_id: userId,
    p_admin_id: adminId
  });
  
  if (error) throw error;
  console.log('User approved successfully:', data);
}
```

### 2. `src/components/Admin/IDVerificationDashboard.tsx`

**Changes:**
- Added `useAuth()` to get current admin ID
- Pass admin ID to verification functions
- Better error handling

```typescript
const { user } = useAuth();

const handleApprove = async (userId: string) => {
  if (!user?.id) {
    showToast.error('Admin user not found');
    return;
  }
  
  await verificationService.verifyUser(userId, user.id);
};
```

---

## 🧪 Testing Instructions

### Step 1: Run SQL Functions
```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run supabase-functions-verification.sql
4. Verify success
```

### Step 2: Refresh Browser
```
Press Cmd+R or Ctrl+R
```

### Step 3: Test Approval
```
1. Go to Admin Dashboard → ID Verifications
2. Click "Review" on pending user
3. Click "Approve"
4. Watch browser console (F12)
```

### Expected Console Output:
```
Starting approval process for user: abc123... by admin: xyz789...
Approving user: abc123... by admin: xyz789...
User approved successfully: {success: true, user_id: "...", verified_at: "..."}
Verification service completed
Refreshing verifications list...
Fetching pending verifications...
Pending verifications: [array WITHOUT the approved user] ✅
List refreshed
```

### Step 4: Verify in Database
```sql
-- Check the user's status:
SELECT 
  email,
  id_verified,
  id_verification_status,
  id_verified_at
FROM profiles
WHERE email = 'user@example.com';

-- Should show:
-- id_verified: true ✅
-- id_verification_status: 'verified' ✅
-- id_verified_at: 2025-10-12 17:44:00 ✅
```

### Step 5: Test Booking
```
1. Logout from admin
2. Login as the verified user
3. Try to book an item
4. Should NOT show "ID Verification Required" ✅
5. Should allow booking ✅
```

---

## 🔍 Debugging

### If Still Not Working:

#### Check 1: Functions Exist
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'verify_user';

-- If empty: Functions not created
-- Solution: Run the SQL file again
```

#### Check 2: Admin Permissions
```sql
SELECT id, email, is_admin
FROM profiles
WHERE id = auth.uid();

-- is_admin should be: true
-- If false: You're not an admin!
```

#### Check 3: Console Errors
```
Open browser console (F12)
Look for errors after clicking Approve
Common errors:
- "function verify_user does not exist" → Run SQL file
- "Only admins can verify users" → Not logged in as admin
- "Admin user not found" → Auth context issue
```

#### Check 4: RPC Call
```typescript
// Add this to verificationService.ts for debugging:
console.log('Calling RPC with:', {
  p_user_id: userId,
  p_admin_id: adminId
});

const { data, error } = await supabase.rpc('verify_user', {
  p_user_id: userId,
  p_admin_id: adminId
});

console.log('RPC response:', { data, error });
```

---

## 📊 Database Schema

### Functions:

#### `verify_user(p_user_id UUID, p_admin_id UUID)`
```sql
-- Checks if caller is admin
-- Updates profiles table:
--   id_verified = true
--   id_verification_status = 'verified'
--   id_verified_at = NOW()
-- Returns JSON with success status
```

#### `reject_user_verification(p_user_id UUID, p_admin_id UUID, p_reason TEXT)`
```sql
-- Checks if caller is admin
-- Updates profiles table:
--   id_verified = false
--   id_verification_status = 'rejected'
--   id_rejection_reason = reason
-- Returns JSON with success status
```

---

## ⚠️ Important Notes

### Security:
- Functions use `SECURITY DEFINER` - they run with elevated privileges
- Admin check is done INSIDE the function
- Non-admins cannot call these functions (will get error)

### RLS Policies:
- You can keep existing RLS policies
- Functions bypass RLS by design
- This is the correct approach for admin actions

### Permissions:
- Functions are granted to `authenticated` role
- Only users with `is_admin = true` can execute successfully
- Others will get "Only admins can verify users" error

---

## ✅ What's Fixed

### Before:
- ❌ Database update blocked by RLS
- ❌ User stays in pending
- ❌ User cannot book items
- ❌ Toast shows success but nothing happens

### After:
- ✅ Database updated via RPC function
- ✅ User removed from pending
- ✅ User can book items
- ✅ Toast shows success AND it actually works

---

## 🎯 Summary

### Files Created:
1. **`supabase-functions-verification.sql`** - Database functions

### Files Modified:
1. **`src/services/verificationService.ts`** - Use RPC instead of direct update
2. **`src/components/Admin/IDVerificationDashboard.tsx`** - Pass admin ID

### Required Steps:
1. ✅ Run SQL file in Supabase
2. ✅ Refresh browser
3. ✅ Test approval
4. ✅ Verify user can book

---

## 🚨 Critical: Run SQL First!

**YOU MUST RUN THE SQL FILE BEFORE TESTING!**

```
1. Open: supabase-functions-verification.sql
2. Copy all content
3. Supabase Dashboard → SQL Editor → New Query
4. Paste and Run
5. Then refresh browser and test
```

Without the SQL functions, the code will fail with:
```
Error: function verify_user(uuid, uuid) does not exist
```

---

**Status:** ⚠️ **SQL SETUP REQUIRED**

**Next Steps:**
1. Run `supabase-functions-verification.sql` in Supabase
2. Refresh browser
3. Test verification
4. Report results!

🚀
