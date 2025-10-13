# 🔧 Payment Status Update Fix

**Issue:** "Failed to update payment status" error when clicking "Mark as Paid"

**Root Cause:** Database permissions (RLS policies) not allowing admin to update payment_status

---

## ✅ Quick Fix (2 Steps)

### **Step 1: Run SQL in Supabase**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Add payment_status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Allow admins to update bookings
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;

CREATE POLICY "Admins can update bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Should see "Success. No rows returned"

---

### **Step 2: Refresh Your Browser**

1. Go back to your admin panel
2. **Hard refresh:** Press `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
3. Try "Mark as Paid" again
4. Should work now! ✅

---

## 🧪 Testing

1. Go to Admin Panel → Orders tab
2. Click "View Details" on any order
3. Scroll to "Payment Status"
4. Click "Mark as Paid"
5. ✅ Should see success message
6. ✅ Status badge should turn green "COMPLETED"

---

## 🔍 Troubleshooting

### **If still not working:**

1. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Look for error messages
   - Share the error with me

2. **Verify you're admin:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT id, email, role 
   FROM profiles 
   WHERE email = 'your-email@example.com';
   ```
   - Should show `role = 'admin'`

3. **Check if column exists:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'bookings' 
   AND column_name = 'payment_status';
   ```
   - Should return one row

4. **Check RLS policies:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'bookings';
   ```
   - Should see "Admins can update bookings"

---

## 📊 What the Fix Does

### **Before:**
- ❌ Admin tries to update payment_status
- ❌ RLS policy blocks the update
- ❌ Error: "Failed to update payment status"

### **After:**
- ✅ Admin tries to update payment_status
- ✅ RLS policy checks if user is admin
- ✅ Update allowed
- ✅ Success: "Payment status updated to COMPLETED"

---

## 🔒 Security

**The RLS policy ensures:**
- ✅ Only admins can update payment status
- ✅ Regular users cannot change it
- ✅ Secure and safe

**Policy Logic:**
```sql
-- Only allow if user is admin
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```

---

## 💡 Alternative: Manual Update

**If SQL doesn't work, you can update manually:**

1. Go to Supabase → Table Editor
2. Open `bookings` table
3. Find the booking
4. Click on `payment_status` cell
5. Change to: `completed`, `pending`, or `failed`
6. Press Enter to save

---

## 🎯 Expected Behavior After Fix

### **Mark as Paid:**
- Click button
- Status changes to "COMPLETED" (green badge)
- Success toast appears
- Modal updates immediately

### **Mark as Pending:**
- Click button
- Status changes to "PENDING" (yellow badge)
- Success toast appears

### **Mark as Failed:**
- Click button
- Status changes to "FAILED" (red badge)
- Success toast appears

---

## 📝 Code Changes Made

**File:** `/src/components/Admin/OrdersManagement.tsx`

**Changes:**
1. ✅ Removed `updated_at` field (causing error)
2. ✅ Added better error logging
3. ✅ Added `.select()` to return updated data
4. ✅ Update selected booking state immediately
5. ✅ Show specific error messages

**Before:**
```typescript
const { error } = await supabase
  .from('bookings')
  .update({ 
    payment_status: newStatus,
    updated_at: new Date().toISOString() // ❌ This was causing error
  } as any)
  .eq('id', booking.id);
```

**After:**
```typescript
const { data, error } = await supabase
  .from('bookings')
  .update({ 
    payment_status: newStatus // ✅ Just update this field
  })
  .eq('id', booking.id)
  .select(); // ✅ Return updated data
```

---

## ✅ Checklist

- [ ] Run SQL in Supabase SQL Editor
- [ ] See "Success" message
- [ ] Refresh browser (Cmd+Shift+R)
- [ ] Test "Mark as Paid" button
- [ ] See green "COMPLETED" badge
- [ ] See success toast message

---

## 🚀 After Fix Works

**You can now:**
1. ✅ Mark payments as completed when received
2. ✅ Change back to pending if needed
3. ✅ Mark as failed if payment fails
4. ✅ Track payment status accurately
5. ✅ Manage orders efficiently

---

**Run the SQL, refresh browser, and it should work! 🎉**

---

## 📞 Quick Reference

**SQL File:** `fix-payment-status-permissions.sql`

**To run:**
1. Supabase → SQL Editor
2. Copy SQL from file
3. Run
4. Refresh browser

**If issues persist:**
- Check browser console (F12)
- Verify you're admin
- Check RLS policies
- Share error message

---

**Status:** 🔧 **FIX READY - JUST RUN THE SQL!**
