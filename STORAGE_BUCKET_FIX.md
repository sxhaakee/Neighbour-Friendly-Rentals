# Storage Bucket Fix - "Bucket not found" Error

## Problem
Error when uploading service images:
```
Error uploading images: StorageApiError: Bucket not found
POST https://epolbovqrclrfozfgwvc.supabase.co/storage/v1/object/service-images 400 (Bad Request)
```

## Root Cause
The storage bucket `service-images` doesn't exist in your Supabase project.

---

## 🚀 Quick Fix (5 minutes)

### Step 1: Go to Supabase Dashboard

1. **Open Supabase:**
   - Go to: https://supabase.com/dashboard
   - Login with your account

2. **Select Your Project:**
   - Click on your "NeighbourFriendly" project (NFRR)

### Step 2: Create Storage Buckets

1. **Go to Storage:**
   - Click "Storage" in the left sidebar
   - You'll see the storage buckets page

2. **Create Required Buckets:**
   
   Click "New bucket" and create these buckets:

   #### Bucket 1: `service-images`
   - **Name:** `service-images`
   - **Public:** ✅ Yes (check the box)
   - **File size limit:** 50 MB
   - **Allowed MIME types:** image/jpeg, image/png, image/webp
   - Click "Create bucket"

   #### Bucket 2: `listing-images` (if not exists)
   - **Name:** `listing-images`
   - **Public:** ✅ Yes
   - **File size limit:** 50 MB
   - **Allowed MIME types:** image/jpeg, image/png, image/webp
   - Click "Create bucket"

   #### Bucket 3: `property-images` (if not exists)
   - **Name:** `property-images`
   - **Public:** ✅ Yes
   - **File size limit:** 50 MB
   - **Allowed MIME types:** image/jpeg, image/png, image/webp
   - Click "Create bucket"

   #### Bucket 4: `verification-documents` (if not exists)
   - **Name:** `verification-documents`
   - **Public:** ❌ No (private)
   - **File size limit:** 10 MB
   - **Allowed MIME types:** image/jpeg, image/png, application/pdf
   - Click "Create bucket"

### Step 3: Set Bucket Policies

For each **public** bucket (`service-images`, `listing-images`, `property-images`):

1. Click on the bucket name
2. Click "Policies" tab
3. Click "New Policy"
4. Select "For full customization"
5. Add these policies:

#### Policy 1: Allow Public Read
```sql
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');
```

#### Policy 2: Allow Authenticated Upload
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Allow Owner Delete
```sql
CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-images' 
  AND auth.uid() = owner
);
```

**Repeat for `listing-images` and `property-images` buckets** (replace `service-images` with the bucket name)

---

## ✅ Verification

### Test Upload:
1. Go to your website
2. Try to update a service with images
3. Upload should work now!

### Check in Supabase:
1. Go to Storage → `service-images`
2. You should see uploaded files

---

## 📋 Required Buckets Summary

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `service-images` | ✅ Yes | Service provider images & portfolios |
| `listing-images` | ✅ Yes | Item rental images |
| `property-images` | ✅ Yes | Property rental images |
| `verification-documents` | ❌ No | ID verification documents (private) |

---

## 🔧 Alternative: SQL Script

If you prefer, run this SQL in Supabase SQL Editor:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('service-images', 'service-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('listing-images', 'listing-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('property-images', 'property-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('verification-documents', 'verification-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Create policies for service-images
CREATE POLICY "Public Read Access - service-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

CREATE POLICY "Authenticated Upload - service-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Owner Delete - service-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-images' 
  AND auth.uid() = owner
);

-- Create policies for listing-images
CREATE POLICY "Public Read Access - listing-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated Upload - listing-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Owner Delete - listing-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images' 
  AND auth.uid() = owner
);

-- Create policies for property-images
CREATE POLICY "Public Read Access - property-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated Upload - property-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Owner Delete - property-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images' 
  AND auth.uid() = owner
);

-- Create policies for verification-documents (private)
CREATE POLICY "Owner Read Access - verification-documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid() = owner
);

CREATE POLICY "Authenticated Upload - verification-documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Owner Delete - verification-documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid() = owner
);
```

---

## 🎯 Step-by-Step with Screenshots

### 1. Navigate to Storage
![Storage Menu](https://via.placeholder.com/800x400?text=Click+Storage+in+Left+Sidebar)

### 2. Create New Bucket
![New Bucket Button](https://via.placeholder.com/800x400?text=Click+New+Bucket+Button)

### 3. Configure Bucket
![Bucket Config](https://via.placeholder.com/800x400?text=Name:+service-images,+Public:+Yes)

### 4. Set Policies
![Policies Tab](https://via.placeholder.com/800x400?text=Click+Policies+Tab+and+Add+Policies)

---

## 🚨 Common Issues

### Issue 1: "Policy already exists"
**Solution:** Ignore, it means the policy is already created.

### Issue 2: "Permission denied"
**Solution:** Make sure you're the project owner or have admin access.

### Issue 3: Images still not uploading
**Solution:**
1. Clear browser cache
2. Logout and login again
3. Check browser console for errors
4. Verify bucket name matches code

---

## 📞 Need Help?

If you still face issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify you're logged in
4. Contact: support@neighbourfriendly.in

---

## ✅ Checklist

- [ ] Created `service-images` bucket (public)
- [ ] Created `listing-images` bucket (public)
- [ ] Created `property-images` bucket (public)
- [ ] Created `verification-documents` bucket (private)
- [ ] Added read policies for public buckets
- [ ] Added upload policies for all buckets
- [ ] Added delete policies for all buckets
- [ ] Tested image upload
- [ ] Images appear in storage

**All checked? You're done!** 🎉

---

## 🎊 Success!

After creating the buckets, your image uploads will work perfectly!

**Test it now:**
1. Go to Edit Service page
2. Upload images
3. Click "Update Service"
4. ✅ Success!
