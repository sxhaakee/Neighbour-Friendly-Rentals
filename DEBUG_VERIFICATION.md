# 🔍 Debug Verification Issue

**Status:** Failed to approve verification

---

## Step 1: Check Browser Console

Open browser console (F12) and look for the error message after clicking "Approve".

You should see:
```
RPC Error Details: {
  message: "...",
  details: "...",
  hint: "...",
  code: "..."
}
```

**Copy this error and share it!**

---

## Step 2: Check if You're Admin

Run this in Supabase SQL Editor:

```sql
-- Check your admin status
SELECT 
  id,
  email,
  is_admin,
  full_name
FROM profiles
WHERE id = auth.uid();
```

**Expected Result:**
- `is_admin` should be `true`

**If `is_admin` is `false` or `null`:**
```sql
-- Make yourself admin:
UPDATE profiles
SET is_admin = true
WHERE id = auth.uid();
```

---

## Step 3: Test the Function Directly

Run this in Supabase SQL Editor:

```sql
-- Replace with actual UUIDs from your database
SELECT verify_user(
  'USER_ID_TO_VERIFY'::UUID,  -- User you want to verify
  'YOUR_ADMIN_ID'::UUID        -- Your admin ID (from auth.uid())
);
```

**To get the IDs:**
```sql
-- Get your admin ID:
SELECT auth.uid() as my_admin_id;

-- Get user ID to verify:
SELECT id, email FROM profiles
WHERE id_verification_status = 'pending'
LIMIT 1;
```

**Then run:**
```sql
SELECT verify_user(
  '[user-id-from-above]'::UUID,
  '[your-admin-id]'::UUID
);
```

**Expected Result:**
```json
{"success": true, "user_id": "...", "verified_at": "..."}
```

**If you get an error:**
- "Only admins can verify users" → You're not admin (run Step 2)
- "function verify_user does not exist" → Functions not created
- Other error → Share the error message

---

## Step 4: Check Function Permissions

```sql
-- Check if functions exist and have correct permissions
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('verify_user', 'reject_user_verification');
```

**Expected:**
- `security_type` should be `DEFINER`

---

## Step 5: Manual Verification (Temporary)

If functions still don't work, manually verify the user:

```sql
-- Get user ID to verify:
SELECT id, email FROM profiles
WHERE id_verification_status = 'pending'
LIMIT 1;

-- Manually verify:
UPDATE profiles
SET 
  id_verified = true,
  id_verification_status = 'verified',
  id_verified_at = NOW()
WHERE id = '[user-id-from-above]'::UUID;

-- Check if it worked:
SELECT id, email, id_verified, id_verification_status
FROM profiles
WHERE id = '[user-id-from-above]'::UUID;
```

---

## Common Issues:

### Issue 1: "Only admins can verify users"
**Solution:**
```sql
UPDATE profiles SET is_admin = true WHERE id = auth.uid();
```

### Issue 2: "function verify_user does not exist"
**Solution:**
Re-run `supabase-functions-verification.sql`

### Issue 3: "permission denied for function verify_user"
**Solution:**
```sql
GRANT EXECUTE ON FUNCTION verify_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_user_verification(UUID, UUID, TEXT) TO authenticated;
```

### Issue 4: RLS blocking the function
**Solution:**
The function uses `SECURITY DEFINER` which should bypass RLS.
Check if the function was created correctly:
```sql
SELECT prosecdef FROM pg_proc WHERE proname = 'verify_user';
-- Should return: true
```

---

## Quick Fix: Disable RLS Temporarily

**⚠️ ONLY FOR TESTING!**

```sql
-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Try approving now
-- If it works, the issue is RLS policies

-- Re-enable RLS after testing:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## Next Steps:

1. ✅ Check browser console for exact error
2. ✅ Verify you're admin (`is_admin = true`)
3. ✅ Test function directly in SQL
4. ✅ Share the error message if still failing

---

**Report back with:**
- Console error message
- Result of admin check
- Result of direct function test
