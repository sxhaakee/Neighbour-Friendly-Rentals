# 🌥️ Cloudinary Setup Guide - 25GB Free Tier

## Why Cloudinary Over Supabase Storage?

### Cloudinary Advantages:
- ✅ **25GB Free Storage** (vs Supabase 1GB)
- ✅ **25GB Monthly Bandwidth** 
- ✅ **Automatic Image Optimization** (WebP, AVIF)
- ✅ **On-the-fly Transformations** (resize, crop, filters)
- ✅ **CDN Delivery** (faster worldwide)
- ✅ **AI-powered features** (auto-tagging, background removal)
- ✅ **Video support** (up to 500MB per file)
- ✅ **Better for production** scaling

### When to Use Cloudinary:
- Image-heavy applications (rental marketplace ✓)
- Need image transformations
- Want automatic optimization
- Global audience
- Professional production app

---

## Step 1: Create Cloudinary Account

1. **Go to**: https://cloudinary.com/users/register/free
2. **Sign up** with:
   - Email
   - Or GitHub/Google
3. **Verify email**
4. **Complete profile**

### Free Tier Includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations/month
- 1,000 video processing seconds/month

---

## Step 2: Get Your Credentials

After signup, go to **Dashboard**:

```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123456
```

**⚠️ IMPORTANT**: Never commit API Secret to Git!

---

## Step 3: Install Cloudinary SDK

```bash
cd /Users/mohammedshakeeb/Desktop/NFRR
npm install cloudinary cloudinary-react
```

---

## Step 4: Setup Environment Variables

Create/Update `.env.local`:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_UPLOAD_PRESET=nfrr_unsigned

# Keep existing Supabase vars
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

---

## Step 5: Create Upload Preset

1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `nfrr_unsigned`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `nfrr/` (organizes uploads)
   - **Format**: `Auto`
   - **Quality**: `Auto`
   - **Allowed formats**: `jpg, png, jpeg, webp, gif`
5. **Save**

---

## Step 6: Create Cloudinary Service

Create `src/services/cloudinaryService.ts`:

```typescript
import { showToast } from '../utils/toast';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface UploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

class CloudinaryService {
  /**
   * Upload single image to Cloudinary
   */
  async uploadImage(file: File, folder: string = 'general'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', `nfrr/${folder}`);
      formData.append('quality', 'auto');
      formData.append('fetch_format', 'auto');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data: UploadResponse = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: File[],
    folder: string = 'general',
    onProgress?: (progress: number) => void
  ): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const url = await this.uploadImage(file, folder);
      if (onProgress) {
        onProgress(((index + 1) / files.length) * 100);
      }
      return url;
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Get optimized image URL
   */
  getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'scale' | 'thumb';
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'avif';
    } = {}
  ): string {
    const {
      width,
      height,
      crop = 'fill',
      quality = 'auto',
      format = 'auto',
    } = options;

    let transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`c_${crop}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);

    const transformation = transformations.join(',');
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
  }

  /**
   * Delete image from Cloudinary
   * Note: Requires backend API with admin credentials
   */
  async deleteImage(publicId: string): Promise<boolean> {
    // This requires server-side implementation with API Secret
    // For now, images will remain in Cloudinary
    // You can manually delete from dashboard or implement backend API
    console.warn('Delete requires backend API');
    return false;
  }
}

export const cloudinaryService = new CloudinaryService();
```

---

## Step 7: Update Upload Components

### Example: Update AddItem.tsx

Replace Supabase upload with Cloudinary:

```typescript
import { cloudinaryService } from '../services/cloudinaryService';

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  if (images.length + files.length > 10) {
    showToast.error('Maximum 10 images allowed');
    return;
  }

  setUploading(true);
  try {
    const uploadedUrls = await cloudinaryService.uploadMultipleImages(
      Array.from(files),
      'products', // folder name
      (progress) => {
        console.log(`Upload progress: ${progress}%`);
      }
    );

    setImages([...images, ...uploadedUrls]);
    showToast.success(`${uploadedUrls.length} image(s) uploaded`);
  } catch (error: any) {
    console.error('Error uploading images:', error);
    showToast.error('Failed to upload images');
  } finally {
    setUploading(false);
  }
};
```

---

## Step 8: Image Optimization Examples

### Thumbnail (200x200):
```typescript
const thumbnailUrl = cloudinaryService.getOptimizedUrl(publicId, {
  width: 200,
  height: 200,
  crop: 'thumb',
  quality: 'auto',
  format: 'webp'
});
```

### Card Image (400x300):
```typescript
const cardUrl = cloudinaryService.getOptimizedUrl(publicId, {
  width: 400,
  height: 300,
  crop: 'fill',
  quality: 'auto'
});
```

### Full Size (responsive):
```typescript
const fullUrl = cloudinaryService.getOptimizedUrl(publicId, {
  width: 1200,
  crop: 'fit',
  quality: 80
});
```

---

## Step 9: Folder Structure

Organize uploads by type:

```
nfrr/
├── products/          # Product listings
├── properties/        # Property images
├── services/          # Service portfolio
├── profiles/          # User avatars
├── documents/         # ID proofs, agreements
└── temp/             # Temporary uploads
```

---

## Step 10: Migration from Supabase

### Option A: Keep Both (Recommended for transition)
- New uploads → Cloudinary
- Existing images → Stay in Supabase
- Gradually migrate old images

### Option B: Full Migration
1. Download all images from Supabase
2. Upload to Cloudinary
3. Update database URLs
4. Delete from Supabase

---

## Pricing Comparison

### Supabase Storage:
- Free: 1GB storage, 2GB bandwidth
- Pro ($25/mo): 100GB storage, 200GB bandwidth

### Cloudinary:
- Free: 25GB storage, 25GB bandwidth
- Plus ($99/mo): 150GB storage, 150GB bandwidth

**Winner for your use case**: Cloudinary Free Tier! 🎉

---

## Best Practices

### 1. Image Formats
- Use WebP for modern browsers (automatic with `f_auto`)
- Fallback to JPEG for older browsers
- PNG for images with transparency

### 2. Quality Settings
- Use `q_auto` for automatic optimization
- Reduces file size by 50-80%
- Maintains visual quality

### 3. Lazy Loading
```tsx
<img
  src={cloudinaryUrl}
  loading="lazy"
  alt="Description"
/>
```

### 4. Responsive Images
```tsx
<img
  srcSet={`
    ${cloudinaryService.getOptimizedUrl(id, { width: 400 })} 400w,
    ${cloudinaryService.getOptimizedUrl(id, { width: 800 })} 800w,
    ${cloudinaryService.getOptimizedUrl(id, { width: 1200 })} 1200w
  `}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  src={cloudinaryService.getOptimizedUrl(id, { width: 800 })}
  alt="Description"
/>
```

### 5. Error Handling
```typescript
try {
  const url = await cloudinaryService.uploadImage(file, 'products');
  // Success
} catch (error) {
  showToast.error('Upload failed. Please try again.');
  // Fallback or retry logic
}
```

---

## Advanced Features

### 1. AI Background Removal
```typescript
const noBgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/e_background_removal/${publicId}`;
```

### 2. Auto-Tagging
Enable in dashboard → Settings → Upload → Auto-tagging

### 3. Face Detection
```typescript
const faceUrl = cloudinaryService.getOptimizedUrl(publicId, {
  width: 400,
  height: 400,
  crop: 'thumb',
  gravity: 'face' // Centers on face
});
```

### 4. Video Uploads
```typescript
// Same API, just change endpoint
const videoUrl = await fetch(
  `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
  // ... same formData
);
```

---

## Monitoring & Analytics

### Dashboard Metrics:
- Storage used
- Bandwidth consumed
- Transformations count
- Popular images
- Geographic distribution

### Alerts:
- Set up email alerts at 80% usage
- Monitor monthly bandwidth
- Track transformation credits

---

## Troubleshooting

### Issue: Upload fails
**Solution**: Check upload preset is unsigned and active

### Issue: Images not loading
**Solution**: Verify CLOUD_NAME is correct

### Issue: Slow uploads
**Solution**: Compress images before upload or use smaller sizes

### Issue: CORS errors
**Solution**: Add your domain to allowed origins in Cloudinary settings

---

## Security Best Practices

1. **Never expose API Secret** in frontend code
2. **Use unsigned presets** for client uploads
3. **Implement file size limits** (max 10MB per image)
4. **Validate file types** before upload
5. **Use signed URLs** for sensitive content
6. **Implement rate limiting** to prevent abuse

---

## Next Steps

1. ✅ Create Cloudinary account
2. ✅ Get credentials
3. ✅ Create upload preset
4. ✅ Add environment variables
5. ✅ Create cloudinaryService.ts
6. ✅ Update upload components
7. ✅ Test uploads
8. ✅ Monitor usage

---

## Support & Resources

- **Documentation**: https://cloudinary.com/documentation
- **React SDK**: https://cloudinary.com/documentation/react_integration
- **Community**: https://community.cloudinary.com
- **Support**: support@cloudinary.com

---

**🎉 You now have professional image management with 25GB free storage!**
