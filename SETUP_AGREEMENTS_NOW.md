# 🚨 URGENT: Setup Rental Agreements Table

**Your agreements aren't showing because the database table doesn't exist yet!**

---

## ⚡ Quick Fix (5 minutes)

### Step 1: Open Supabase
1. Go to [supabase.com](https://supabase.com)
2. Login to your account
3. Open your project

### Step 2: Run SQL
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy the ENTIRE contents of `create-rental-agreements-table.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)

### Step 3: Verify
1. Go to **"Table Editor"** in the left sidebar
2. You should see a new table: **`rental_agreements`**
3. Click on it to verify it has these columns:
   - id
   - booking_id
   - listing_id
   - renter_id
   - owner_id
   - agreement_data
   - renter_name
   - renter_email
   - renter_phone
   - owner_name
   - owner_email
   - owner_phone
   - item_title
   - item_description
   - start_date
   - end_date
   - total_days
   - total_price
   - security_deposit
   - status
   - agreed_at
   - completed_at
   - created_at
   - updated_at
   - deleted_at

### Step 4: Refresh Your App
1. Go back to your app at `localhost:5174/admin`
2. Click on **"Agreements"** tab
3. Agreements should now show! ✅

---

## 🧪 Test It

### Create a Test Agreement:
1. Go to your app
2. Book an item (any item)
3. Complete the booking
4. Go to Admin → Agreements
5. You should see the agreement! ✅

---

## 🔍 If Still Not Showing

### Check Console Errors:
1. Open browser console (F12)
2. Look for errors
3. Common issues:

#### Error: "relation 'rental_agreements' does not exist"
**Solution:** Run the SQL file in Supabase

#### Error: "permission denied for table rental_agreements"
**Solution:** RLS policies not created. Run the SQL file again (it includes RLS policies)

#### Error: "column 'xxx' does not exist"
**Solution:** Table structure is wrong. Drop the table and run SQL again:
```sql
DROP TABLE IF EXISTS rental_agreements CASCADE;
```
Then run the full SQL file again.

---

## 📊 Expected Result

After running the SQL, you should see:

### In Supabase:
- ✅ `rental_agreements` table exists
- ✅ All columns present
- ✅ RLS policies enabled
- ✅ Indexes created
- ✅ Triggers created
- ✅ Views created

### In Your App:
- ✅ Agreements tab shows stats (0, 0, 0, 0, 0)
- ✅ "No Agreements Found" message (if no bookings yet)
- ✅ After booking, agreement appears automatically

---

## 🎯 Quick Verification Query

Run this in Supabase SQL Editor to verify everything:

```sql
-- Check if table exists
SELECT 
  'rental_agreements table exists' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'rental_agreements'
  ) THEN 'YES ✅' ELSE 'NO ❌' END as result
UNION ALL
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'rental_agreements' 
    AND rowsecurity = true
  ) THEN 'YES ✅' ELSE 'NO ❌' END
UNION ALL
SELECT 
  'RLS policies count',
  CAST(COUNT(*) AS TEXT) || ' policies'
FROM pg_policies WHERE tablename = 'rental_agreements'
UNION ALL
SELECT 
  'Indexes count',
  CAST(COUNT(*) AS TEXT) || ' indexes'
FROM pg_indexes WHERE tablename = 'rental_agreements'
UNION ALL
SELECT 
  'Total agreements',
  CAST(COUNT(*) AS TEXT) || ' agreements'
FROM rental_agreements;
```

**Expected Output:**
```
rental_agreements table exists | YES ✅
RLS enabled                    | YES ✅
RLS policies count             | 5 policies
Indexes count                  | 6 indexes
Total agreements               | 0 agreements (or more if you have bookings)
```

---

## 🚀 After Setup

Once the table is created:

1. **Existing bookings won't have agreements** (they were created before the feature)
2. **New bookings will automatically create agreements** ✅
3. **You can view/download/delete agreements in Admin panel** ✅

---

## 💡 Pro Tip

To create agreements for existing bookings, you can run this SQL:

```sql
-- This will create agreements for all confirmed bookings that don't have one yet
-- (You'll need to customize this based on your data)

INSERT INTO rental_agreements (
  booking_id,
  listing_id,
  renter_id,
  owner_id,
  renter_name,
  renter_email,
  renter_phone,
  owner_name,
  owner_email,
  owner_phone,
  item_title,
  start_date,
  end_date,
  total_days,
  total_price,
  security_deposit,
  agreement_data,
  status
)
SELECT 
  b.id,
  b.listing_id,
  b.renter_id,
  b.owner_id,
  b.renter_name,
  b.renter_email,
  b.renter_phone,
  'Owner', -- You'll need to get actual owner name
  'owner@email.com', -- You'll need to get actual owner email
  '0000000000', -- You'll need to get actual owner phone
  l.title,
  b.start_date,
  b.end_date,
  b.total_days,
  b.total_price,
  COALESCE(b.security_deposit, 0),
  jsonb_build_object(
    'booking_id', b.id,
    'created_at', NOW()
  ),
  CASE 
    WHEN b.status = 'confirmed' THEN 'active'
    WHEN b.status = 'completed' THEN 'completed'
    WHEN b.status = 'cancelled' THEN 'cancelled'
    ELSE 'active'
  END
FROM bookings b
JOIN listings l ON b.listing_id = l.id
WHERE b.status IN ('confirmed', 'completed')
AND NOT EXISTS (
  SELECT 1 FROM rental_agreements ra 
  WHERE ra.booking_id = b.id
);
```

---

## ✅ Checklist

- [ ] Opened Supabase dashboard
- [ ] Went to SQL Editor
- [ ] Copied `create-rental-agreements-table.sql`
- [ ] Pasted and ran the SQL
- [ ] Verified table exists in Table Editor
- [ ] Refreshed app
- [ ] Checked Agreements tab
- [ ] Created a test booking
- [ ] Verified agreement appears

---

**Status:** ⏳ **WAITING FOR YOU TO RUN THE SQL**

**Once you run the SQL file in Supabase, agreements will show immediately!** 🚀

---

## 🆘 Need Help?

If you're stuck:

1. **Screenshot the error** in browser console
2. **Screenshot Supabase** Table Editor
3. **Check if SQL ran successfully** (should say "Success" in Supabase)

The most common issue is simply forgetting to run the SQL file! 😊
