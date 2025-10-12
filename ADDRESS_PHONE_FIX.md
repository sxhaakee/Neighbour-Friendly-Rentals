# ✅ Owner Phone & Address Fix

**Date:** October 12, 2025, 21:59  
**Status:** Fixed

---

## ❌ **Problem:**

PDF showing "N/A" for:
- ✅ Lender (Owner) Phone: N/A
- ✅ Lender (Owner) Address: N/A  
- ✅ Renter Address: N/A

---

## 🔍 **Root Cause:**

### **Issue 1: Owner Phone**
The code was trying to get `typedListing.owner_phone`, but:
- Listings table doesn't have `owner_phone` field
- Owner phone is in the `profiles` table
- Wasn't being fetched

### **Issue 2: Addresses**
- Addresses weren't being included in the agreement data at all
- Both renter and owner addresses were missing

---

## ✅ **Solution:**

### **Step 1: Fetch Owner Profile**
Added code to fetch owner's complete profile data:

```typescript
// Fetch owner profile for complete data
const { data: ownerProfile } = await supabase
  .from('profiles')
  .select('full_name, email, phone, address')
  .eq('id', typedListing.owner_id)
  .single();
```

### **Step 2: Include All Data**
Updated agreement creation to include:

```typescript
renter: {
  name: profile.full_name || profile.email,
  email: profile.email,
  phone: renterPhone || profile.phone || '',
  address: profile.address || 'Not provided',  // ✅ Added
},
owner: {
  name: ownerProfile?.full_name || 'Owner',
  email: ownerProfile?.email || '',
  phone: ownerProfile?.phone || 'Not provided',  // ✅ Fixed
  address: ownerProfile?.address || 'Not provided',  // ✅ Added
},
```

---

## 📊 **What Changed:**

### **Before:**
```typescript
owner: {
  name: typedListing.owner_name,
  email: typedListing.owner_email,
  phone: typedListing.owner_phone,  // ❌ Doesn't exist!
  // ❌ No address field
}
```

### **After:**
```typescript
// ✅ Fetch owner profile first
const { data: ownerProfile } = await supabase
  .from('profiles')
  .select('full_name, email, phone, address')
  .eq('id', typedListing.owner_id)
  .single();

owner: {
  name: ownerProfile?.full_name,
  email: ownerProfile?.email,
  phone: ownerProfile?.phone || 'Not provided',  // ✅ From profile
  address: ownerProfile?.address || 'Not provided',  // ✅ Added
}
```

---

## 🧪 **Testing:**

### **Step 1: Create New Booking**
1. Go to your app
2. Book an item
3. Complete the booking

### **Step 2: Download PDF**
1. Go to Admin → Agreements
2. Find the new agreement
3. Click download icon
4. Check PDF:
   - ✅ Owner phone should show (if in profile)
   - ✅ Owner address should show (if in profile)
   - ✅ Renter address should show (if in profile)

---

## ⚠️ **Important Notes:**

### **For Existing Agreements:**
- Old agreements will still show "N/A"
- This fix only applies to NEW bookings
- Old data can't be retroactively fixed (data wasn't saved)

### **For New Agreements:**
- ✅ Will show phone if user has it in profile
- ✅ Will show address if user has it in profile
- ⚠️ Will show "Not provided" if user hasn't added these to profile

---

## 📝 **How to Add Phone/Address to Profile:**

### **For Users:**
Currently, there's no UI to edit profile. You can add it via Supabase:

1. Go to Supabase → Table Editor
2. Open `profiles` table
3. Find your user
4. Edit the row:
   - Add `phone` number
   - Add `address`
5. Save

### **For Future:**
Consider adding a "Profile Settings" page where users can:
- Update phone number
- Update address
- Update other profile info

---

## 🎯 **Expected Result:**

### **If User Has Phone/Address in Profile:**
```
Lender (Owner):
  Name: Shakeeb
  Phone: 8697008        ✅ Shows actual phone
  Address: Mangalore    ✅ Shows actual address

Renter (User):
  Name: Mohammed Shakeeb
  Phone: 8697008        ✅ Shows actual phone
  Address: Mangalore    ✅ Shows actual address
```

### **If User Hasn't Added Phone/Address:**
```
Lender (Owner):
  Name: Shakeeb
  Phone: Not provided   ⚠️ User needs to add
  Address: Not provided ⚠️ User needs to add

Renter (User):
  Name: Mohammed Shakeeb
  Phone: 8697008        ✅ From booking form
  Address: Not provided ⚠️ User needs to add
```

---

## 📁 **Files Modified:**

**`src/pages/BookItem.tsx`**
- Added supabase import
- Added owner profile fetch
- Included address fields in agreement data
- Fixed owner phone to come from profile

---

## 🚀 **To Test:**

1. **Refresh app** (Cmd+Shift+R)
2. **Create a new booking**
3. **Go to Admin → Agreements**
4. **Download the PDF**
5. **Check if phone/address show** ✅

---

## 💡 **Pro Tip:**

To ensure all users have complete profiles, you can:

1. **Add Profile Edit Page:**
   - Create `/profile` route
   - Form to edit phone, address, etc.
   - Save to profiles table

2. **Make Fields Required:**
   - Require phone during signup
   - Require address before first booking
   - Validate on form submission

3. **Update Existing Users:**
   Run this SQL in Supabase to add default addresses:
   ```sql
   UPDATE profiles 
   SET address = 'Address not provided'
   WHERE address IS NULL;
   ```

---

## ✅ **Summary:**

### **Fixed:**
- ✅ Owner phone now fetched from profiles table
- ✅ Owner address included in agreement
- ✅ Renter address included in agreement
- ✅ Shows "Not provided" instead of "N/A"

### **Result:**
- ✅ New bookings will have complete data
- ✅ PDFs will show phone/address if available
- ✅ Clear message if data not provided

### **Next Steps:**
1. Test with new booking
2. Add profile edit page (optional)
3. Encourage users to complete profiles

---

**Status:** ✅ **FIXED**

**Create a new booking to see the fix in action!** 🎉

---

## 🔄 **For Existing Agreements:**

If you want to update existing agreements with phone/address data, you can run this SQL in Supabase:

```sql
-- Update existing agreements with owner data
UPDATE rental_agreements ra
SET 
  owner_phone = COALESCE(p.phone, 'Not provided'),
  agreement_data = jsonb_set(
    jsonb_set(
      ra.agreement_data,
      '{owner,phone}',
      to_jsonb(COALESCE(p.phone, 'Not provided'))
    ),
    '{owner,address}',
    to_jsonb(COALESCE(p.address, 'Not provided'))
  )
FROM profiles p
WHERE ra.owner_id = p.id;

-- Update existing agreements with renter data
UPDATE rental_agreements ra
SET 
  agreement_data = jsonb_set(
    ra.agreement_data,
    '{renter,address}',
    to_jsonb(COALESCE(p.address, 'Not provided'))
  )
FROM profiles p
WHERE ra.renter_id = p.id;
```

This will update all existing agreements with current profile data!
