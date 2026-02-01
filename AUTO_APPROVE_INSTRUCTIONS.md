# Auto-Approve Migration Instructions

## 🎯 **Quick Instructions:**

1. **Open Supabase Dashboard:** https://supabase.com/dashboard/project/epolbovqrclrfozfgwvc/sql/new

2. **Copy the SQL below** and paste it into the SQL Editor

3. **Click "Run"**

---

## 📝 **SQL to Copy:**

```sql
-- Auto-approve all pending listings, services, and properties
-- This will make all existing content appear in the Google Merchant Center feed

-- Auto-approve all listings
UPDATE listings
SET status = 'approved',
    rejection_reason = NULL
WHERE status = 'pending';

-- Auto-approve all service providers
UPDATE service_providers
SET status = 'approved',
    rejection_reason = NULL
WHERE status = 'pending';

-- Auto-approve all properties
UPDATE properties
SET status = 'approved',
    rejection_reason = NULL
WHERE status = 'pending';

-- Show results
SELECT 
    'Listings' as table_name, 
    COUNT(*) as approved_count 
FROM listings 
WHERE status = 'approved'
UNION ALL
SELECT 
    'Services', 
    COUNT(*) 
FROM service_providers 
WHERE status = 'approved'
UNION ALL
SELECT 
    'Properties', 
    COUNT(*) 
FROM properties 
WHERE status = 'approved';
```

---

## ✅ **After Running:**

1. The query will show how many items were approved
2. Wait 1-2 minutes for the feed to update
3. Go back to **Google Merchant Center** and click **"Update"**
4. Your products should appear! 🎉

---

## 🔗 **Quick Links:**

- **Supabase SQL Editor:** https://supabase.com/dashboard/project/epolbovqrclrfozfgwvc/sql/new
- **Product Feed:** https://neighbourfriendly.in/api/product-feed
- **Google Merchant Center:** https://merchants.google.com/
