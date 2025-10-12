# 🔧 Fix: Failed to Create Booking

**Error:** "Failed to create booking" toast notification

**Status:** ⚠️ **NEEDS SQL FIX**

---

## 🐛 Problem

User is verified ✅ but cannot create bookings ❌

**Root Cause:** RLS (Row Level Security) policies are blocking the booking insert.

---

## ✅ Solution

### Step 1: Run SQL to Fix RLS Policies

**File:** `fix-booking-rls.sql`

```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy content from fix-booking-rls.sql
4. Click "Run"
5. Should see: "Success"
```

**What this does:**
- Drops old/conflicting RLS policies
- Creates new policies that allow:
  - ✅ Users can INSERT their own bookings
  - ✅ Users can VIEW their own bookings
  - ✅ Owners can VIEW bookings for their items
  - ✅ Admins can VIEW and UPDATE all bookings

---

### Step 2: Refresh Browser

```
Press Cmd+R or Ctrl+R
```

---

### Step 3: Test Booking

```
1. Go to any listing
2. Click "Book Now"
3. Fill in dates
4. Click "Proceed to Agreement"
5. Open browser console (F12)
6. Watch for logs
```

**Expected Console Output:**
```
Creating booking with data: {...}
Booking created successfully: {...}
✅ Success!
```

**If error:**
```
Booking creation error: {
  message: "...",
  details: "...",
  hint: "...",
  code: "..."
}
```

**Share this error message!**

---

## 🔍 Debug Steps

### Check 1: Verify User is Verified

```sql
SELECT id, email, id_verified, id_verification_status
FROM profiles
WHERE id = auth.uid();
```

**Expected:**
- `id_verified` = `true`
- `id_verification_status` = `'verified'`

---

### Check 2: Verify RLS Policies

```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'bookings';
```

**Should show 4 policies:**
1. Users can create their own bookings (INSERT)
2. Users can view their own bookings (SELECT)
3. Admins can view all bookings (SELECT)
4. Admins can update bookings (UPDATE)

---

### Check 3: Test Policy Manually

```sql
-- Try inserting a test booking
INSERT INTO bookings (
  listing_id,
  renter_id,
  renter_name,
  renter_email,
  owner_id,
  start_date,
  end_date,
  total_days,
  total_price,
  item_price,
  platform_commission,
  security_deposit,
  payment_method,
  status,
  payment_status
) VALUES (
  '[some-listing-id]'::UUID,
  auth.uid(),
  'Test User',
  'test@example.com',
  '[owner-id]'::UUID,
  '2025-10-15',
  '2025-10-20',
  5,
  500,
  400,
  40,
  100,
  'cash',
  'pending',
  'pending'
);

-- If this works, RLS is fixed!
-- Delete the test booking:
DELETE FROM bookings WHERE renter_name = 'Test User';
```

---

## 🚨 Common Issues

### Issue 1: "new row violates row-level security policy"
**Solution:** Run `fix-booking-rls.sql`

### Issue 2: "null value in column violates not-null constraint"
**Solution:** Missing required field. Check console for which field.

### Issue 3: "foreign key violation"
**Solution:** 
- `listing_id` doesn't exist
- `owner_id` doesn't exist
- Check if listing exists:
```sql
SELECT id, title FROM listings WHERE id = '[listing-id]';
```

### Issue 4: "permission denied for table bookings"
**Solution:** RLS is blocking. Run the SQL fix.

---

## 📊 What the SQL Does

### Before (BROKEN):
```
User tries to create booking
→ RLS blocks INSERT
→ Error: "Failed to create booking"
```

### After (FIXED):
```
User tries to create booking
→ RLS checks: Is auth.uid() = renter_id?
→ Yes! ✅
→ INSERT allowed
→ Booking created successfully!
```

---

## ✅ Testing Checklist

After running SQL:

- [ ] Refresh browser
- [ ] Try creating a booking
- [ ] Check console for errors
- [ ] Verify booking appears in database
- [ ] Check if booking shows in dashboard

---

## 🎯 Quick Test Query

After running the SQL, test with:

```sql
-- Check if you can insert
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'bookings' 
      AND policyname = 'Users can create their own bookings'
    ) THEN 'Policy exists ✅'
    ELSE 'Policy missing ❌'
  END as policy_status;
```

---

**Status:** ⚠️ **RUN fix-booking-rls.sql FIRST!**

**Next:** Run SQL → Refresh → Test booking → Report results! 🚀
