# Social Media Preview Fix - Show Item Images on WhatsApp/Facebook/Twitter

## Problem
When sharing links to items, services, or properties on WhatsApp, Facebook, or Twitter, the NFR logo appears instead of the actual item image.

## Root Cause
Social media platforms (WhatsApp, Facebook, Twitter) use **web crawlers** that read meta tags from the HTML **before** JavaScript runs. Since your app is a React SPA (Single Page Application), the meta tags are updated **after** the page loads via JavaScript, which the crawlers cannot see.

---

## 🚀 Solution Options

### **Option 1: Use Vercel's Built-in OG Image Generation (RECOMMENDED)**

Since you're on Vercel, you can use their OG Image API:

1. **Create an API route** for dynamic OG images
2. **Update meta tags** to point to the API route

#### Step 1: Create `api/og.tsx` (Vercel Edge Function)

Create a new file: `/api/og.tsx`

```tsx
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || 'NeighbourFriendly Rentals';
  const image = searchParams.get('image');
  const price = searchParams.get('price');
  const type = searchParams.get('type') || 'item';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          backgroundImage: image ? `url(${image})` : 'linear-gradient(to bottom, #f59e0b, #d97706)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>
            {title}
          </div>
          {price && (
            <div style={{ fontSize: 32, color: '#fbbf24', marginTop: 10 }}>
              ₹{price}/day
            </div>
          )}
          <div style={{ fontSize: 24, color: '#d1d5db', marginTop: 10 }}>
            NeighbourFriendly Rentals
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

#### Step 2: Update `metaTags.ts`

```typescript
export const updateMetaTags = (options: MetaTagsOptions) => {
  const {
    title,
    description,
    image,
    url,
    type = 'product',
    price,
    currency = 'INR'
  } = options;

  // Generate OG image URL using Vercel's API
  const ogImageUrl = `https://neighbourfriendly.in/api/og?title=${encodeURIComponent(title)}&image=${encodeURIComponent(image)}&price=${price}&type=${type}`;

  // Update document title
  document.title = `${title} | NeighbourFriendly Rentals`;

  // Helper function to set or update meta tag
  const setMetaTag = (property: string, content: string, isName = false) => {
    const attribute = isName ? 'name' : 'property';
    let element = document.querySelector(`meta[${attribute}="${property}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, property);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };

  // Basic meta tags
  setMetaTag('description', description, true);

  // Open Graph tags - USE THE GENERATED OG IMAGE
  setMetaTag('og:title', title);
  setMetaTag('og:description', description);
  setMetaTag('og:image', ogImageUrl); // ← Use generated OG image
  setMetaTag('og:image:width', '1200');
  setMetaTag('og:image:height', '630');
  setMetaTag('og:url', url);
  setMetaTag('og:type', type);
  setMetaTag('og:site_name', 'NeighbourFriendly Rentals');
  setMetaTag('og:locale', 'en_IN');

  // Twitter Card tags
  setMetaTag('twitter:card', 'summary_large_image', true);
  setMetaTag('twitter:title', title, true);
  setMetaTag('twitter:description', description, true);
  setMetaTag('twitter:image', ogImageUrl, true); // ← Use generated OG image
  setMetaTag('twitter:url', url, true);

  // Product-specific tags
  if (price) {
    setMetaTag('og:price:amount', price.toString());
    setMetaTag('og:price:currency', currency);
    setMetaTag('product:price:amount', price.toString());
    setMetaTag('product:price:currency', currency);
  }

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
};
```

---

### **Option 2: Use Prerender.io (Simpler, No Code Changes)**

Prerender.io is a service that pre-renders your React pages for social media crawlers.

#### Step 1: Sign up for Prerender.io
- Go to https://prerender.io
- Sign up for free (500 pages/month free)
- Get your API token

#### Step 2: Add Prerender middleware to Vercel

Create `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": ".*(bot|crawler|spider|whatsapp|facebook|twitter|linkedin).*"
        }
      ],
      "destination": "https://service.prerender.io/https://neighbourfriendly.in/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Prerender-Token",
          "value": "YOUR_PRERENDER_TOKEN_HERE"
        }
      ]
    }
  ]
}
```

---

### **Option 3: Server-Side Rendering with Vite SSR (Advanced)**

This requires significant refactoring. Not recommended unless you want full SSR.

---

## 🎯 RECOMMENDED: Quick Fix (Option 1)

**Use Vercel's OG Image API** - it's free, fast, and works perfectly with your setup.

### Implementation Steps:

1. **Install @vercel/og**:
```bash
npm install @vercel/og
```

2. **Create `/api/og.tsx`** (as shown above)

3. **Update `src/utils/metaTags.ts`** (as shown above)

4. **Deploy to Vercel**

5. **Test**:
   - Share a link on WhatsApp
   - The item image should now appear!

---

## 🧪 Testing Your Fix

### Test on WhatsApp:
1. Share a link: `https://neighbourfriendly.in/item/123`
2. WhatsApp should show the item image

### Test on Facebook:
1. Use Facebook Debugger: https://developers.facebook.com/tools/debug/
2. Paste your URL
3. Click "Scrape Again"
4. Should show the item image

### Test on Twitter:
1. Use Twitter Card Validator: https://cards-dev.twitter.com/validator
2. Paste your URL
3. Should show the item image

---

## 📋 Checklist

- [ ] Install @vercel/og package
- [ ] Create `/api/og.tsx` file
- [ ] Update `src/utils/metaTags.ts`
- [ ] Deploy to Vercel
- [ ] Test on WhatsApp
- [ ] Test on Facebook Debugger
- [ ] Test on Twitter Card Validator
- [ ] Clear cache if needed

---

## 🚨 Common Issues

### Issue 1: "Image not showing on WhatsApp"
**Solution:** 
- WhatsApp caches aggressively
- Wait 24 hours OR
- Use a different URL parameter (e.g., add `?v=2`)

### Issue 2: "OG image is too small"
**Solution:**
- Ensure image is at least 1200x630px
- Use the Vercel OG API (automatically sized)

### Issue 3: "Still showing NFR logo"
**Solution:**
- Clear Facebook cache: https://developers.facebook.com/tools/debug/
- Click "Scrape Again"
- Wait for crawlers to re-index

---

## ✅ Expected Result

**Before:**
- WhatsApp shows: NFR logo
- Facebook shows: NFR logo

**After:**
- WhatsApp shows: Actual item/service/property image
- Facebook shows: Actual item/service/property image with title and price
- Twitter shows: Beautiful card with image

---

## 💡 Why This Works

1. **Vercel OG API** generates images on-the-fly
2. **Edge runtime** = super fast
3. **Crawlers see the image** before JavaScript runs
4. **No caching issues** - each URL gets its own image

---

## 🎊 Success!

After implementing Option 1, your social media previews will look **professional** and show the **actual item images**!

**Need help?** Contact: support@neighbourfriendly.in
