# 🔴 DATABASE UPDATE REQUIRED - PRICING MODEL COLUMN

## Issue
When updating item details, you're getting "Failed to update item" error because the `pricing_model` column doesn't exist in the database yet.

## Solution
You need to add the `pricing_model` column to your `listings` table in Supabase.

---

## 🚀 Quick Fix (Recommended)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: **NeighbourFriendly Rentals**
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run This SQL
Copy and paste this SQL into the SQL Editor and click **RUN**:

```sql
-- Add pricing_model column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'per_day' 
CHECK (pricing_model IN ('per_day', 'per_week', 'per_month', 'per_event', 'per_hour'));

-- Update existing listings to have default pricing_model
UPDATE listings 
SET pricing_model = 'per_day' 
WHERE pricing_model IS NULL;

-- Add comment to column
COMMENT ON COLUMN listings.pricing_model IS 'Pricing model for the listing: per_day, per_week, per_month, per_event, or per_hour';
```

### Step 3: Verify
After running the SQL, verify the column was added:

```sql
-- Check if column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name = 'pricing_model';
```

You should see:
```
column_name    | data_type | column_default
pricing_model  | text      | 'per_day'::text
```

---

## ✅ What This Does

1. **Adds Column**: Creates `pricing_model` column in `listings` table
2. **Default Value**: Sets default to `'per_day'` for all new listings
3. **Validation**: Ensures only valid values can be stored:
   - `per_day` - Per Day pricing
   - `per_week` - Per Week pricing
   - `per_month` - Per Month pricing
   - `per_event` - Per Event pricing
   - `per_hour` - Per Hour pricing
4. **Updates Existing**: Sets all existing listings to `'per_day'`

---

## 🔍 Troubleshooting

### Error: "column already exists"
✅ **Good!** The column is already there. You can skip this step.

### Error: "permission denied"
❌ Make sure you're logged in as the project owner or have admin access.

### Error: "relation listings does not exist"
❌ Your table might have a different name. Check your table name in Supabase.

---

## 🧪 Test After Update

1. Go to your website
2. Try to edit an existing listing
3. Change the pricing model
4. Click **Update**
5. ✅ Should see "Listing updated successfully!"

---

## 📝 Alternative: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to project directory
cd /Users/mohammedshakeeb/Desktop/NFRR

# Apply migration
supabase db push

# Or run migration directly
supabase db execute -f supabase/migrations/20241103_add_pricing_model.sql
```

---

## 🎯 Summary

**Problem:** `pricing_model` column missing in database  
**Solution:** Run SQL to add column  
**Time:** 30 seconds  
**Difficulty:** Easy  

**After this fix:**
- ✅ Item updates will work
- ✅ Pricing models will save correctly
- ✅ No more "Failed to update item" errors

---

## 📞 Need Help?

If you're still having issues after running the SQL:

1. Check browser console for errors (F12)
2. Check Supabase logs in dashboard
3. Verify the column exists in Table Editor
4. Try creating a new listing first (to test)

---

**Status:** ⚠️ Action Required - Run SQL in Supabase Dashboard
