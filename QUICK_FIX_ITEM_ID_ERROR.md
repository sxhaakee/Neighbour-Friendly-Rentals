# 🔧 QUICK FIX: "column item_id does not exist" Error

## **Problem:**
You're getting this error when running migrations:
```
ERROR: 42703: column "item_id" does not exist
```

## **Cause:**
Your database has an old `bookings` table that uses `item_id` instead of `listing_id`.

---

## **SOLUTION:**

### **Option 1: Rename Column (Keeps Your Data)** ✅ RECOMMENDED

Run this SQL in Supabase SQL Editor:

```sql
-- Rename item_id to listing_id in bookings table
ALTER TABLE bookings RENAME COLUMN item_id TO listing_id;
```

**OR** run the complete fix file:

```sql
-- File: FIX_BOOKINGS_TABLE.sql
-- Copy and paste the entire file into Supabase SQL Editor
```

---

### **Option 2: Drop and Recreate (Deletes All Bookings)** ⚠️ CAUTION

Only use this if you don't have important booking data:

```sql
-- Drop existing bookings table
DROP TABLE IF EXISTS bookings CASCADE;

-- Then run PHASE1_DATABASE_MIGRATION.sql
-- It will create the table with listing_id
```

---

## **COMPLETE FIX SEQUENCE:**

Run these in order:

### 1. Fix Reviews Table
```sql
-- Run: FIX_REVIEWS_TABLE.sql
```

### 2. Fix Bookings Table (if it exists)
```sql
-- Run: FIX_BOOKINGS_TABLE.sql
-- OR manually:
ALTER TABLE bookings RENAME COLUMN item_id TO listing_id;
```

### 3. Run Phase 1 Migration
```sql
-- Run: PHASE1_DATABASE_MIGRATION.sql
```

### 4. Run Phase 2 Migration
```sql
-- Run: PHASE2_FEATURES_MIGRATION.sql
```

### 5. Run Phase 3 Migration
```sql
-- Run: PHASE3_ADVANCED_FEATURES_MIGRATION.sql
```

---

## **VERIFICATION:**

After fixing, verify the column exists:

```sql
-- Check if listing_id exists in bookings
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'listing_id';

-- Should return: listing_id
```

---

## **WHY THIS HAPPENED:**

The codebase was updated to use consistent naming:
- ❌ Old: `item_id` (inconsistent)
- ✅ New: `listing_id` (consistent with reviews table)

All references in the code have been updated to use `listing_id`.

---

## **DONE! ✅**

After running the fix, your database will be consistent and all migrations will work!

**No more errors!** 🎉
