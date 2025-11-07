# 🚀 Fix Social Media Previews with Prerender.io

## The Problem
Your React SPA updates meta tags **client-side**, but social media crawlers (Facebook, WhatsApp, Twitter) don't execute JavaScript. They only see the static HTML from `index.html`.

**Result**: They always see the default NFR logo, never the actual item images.

---

## ✅ The Solution: Prerender.io

Prerender.io intercepts crawler requests and serves them pre-rendered HTML with the correct meta tags.

### How it Works:
```
User Browser → Sees React App (normal)
Facebook Bot → Gets Pre-rendered HTML (with correct meta tags)
```

---

## 📋 Setup Steps

### 1. Sign Up for Prerender.io
1. Go to https://prerender.io
2. Sign up (Free tier: 250 pages/month)
3. Get your **Prerender Token**

### 2. Add Prerender Middleware to Vercel

Create `vercel.json` in your project root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/prerender?url=https://neighbourfriendly.in/$1",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": ".*(bot|crawler|spider|crawling|facebook|twitter|whatsapp|linkedin).*"
        }
      ]
    }
  ]
}
```

### 3. Create Prerender API Route

Create `api/prerender.js`:

```javascript
export default async function handler(req, res) {
  const { url } = req.query;
  const prerenderToken = process.env.PRERENDER_TOKEN;

  if (!prerenderToken) {
    return res.status(500).json({ error: 'Prerender token not configured' });
  }

  try {
    const response = await fetch(`https://service.prerender.io/${url}`, {
      headers: {
        'X-Prerender-Token': prerenderToken,
      },
    });

    const html = await response.text();
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Prerender error:', error);
    res.status(500).json({ error: 'Failed to prerender' });
  }
}
```

### 4. Add Environment Variable

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add: `PRERENDER_TOKEN` = `your_prerender_token`
3. Redeploy

---

## 🎯 Alternative: Simpler Solution (Recommended)

### Use Vercel's Built-in Prerendering

1. Install `@vercel/og`:
```bash
npm install @vercel/og
```

2. Create `api/og/[...path].tsx`:

```typescript
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'NeighbourFriendly Rentals';
    const image = searchParams.get('image');
    const price = searchParams.get('price');

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
            backgroundImage: image ? `url(${image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h1 style={{ fontSize: 60, fontWeight: 'bold', margin: 0 }}>
              {title}
            </h1>
            {price && (
              <p style={{ fontSize: 40, color: '#f59e0b', margin: '10px 0 0 0' }}>
                ₹{price}
              </p>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
```

3. Update your meta tags to use this:

```typescript
// In ItemDetails.tsx
updateMetaTags({
  title: item.title,
  description: item.description,
  image: `https://neighbourfriendly.in/api/og?title=${encodeURIComponent(item.title)}&image=${encodeURIComponent(item.images[0])}&price=${item.price}`,
  url: window.location.href,
  type: 'product'
});
```

---

## 🎊 Easiest Solution: Use React Helmet Async

Actually, the **EASIEST** solution is to use `react-helmet-async` which handles SSR better:

### 1. Install:
```bash
npm install react-helmet-async
```

### 2. Wrap your App:

```typescript
// In main.tsx or App.tsx
import { HelmetProvider } from 'react-helmet-async';

<HelmetProvider>
  <App />
</HelmetProvider>
```

### 3. Use in Components:

```typescript
import { Helmet } from 'react-helmet-async';

// In ItemDetails.tsx
<Helmet>
  <title>{item.title} - NeighbourFriendly Rentals</title>
  <meta property="og:title" content={item.title} />
  <meta property="og:description" content={item.description} />
  <meta property="og:image" content={item.images[0]} />
  <meta property="og:url" content={window.location.href} />
</Helmet>
```

---

## ⚠️ Reality Check

**None of these will work perfectly** because:
- Facebook/WhatsApp crawlers don't execute JavaScript
- They need server-side rendered HTML
- Your app is a pure client-side React SPA

### The ONLY Real Solutions:

1. **Migrate to Next.js** (Best, but requires work)
2. **Use Prerender.io** (Costs money after free tier)
3. **Accept that social previews show default image** (Free, but not ideal)

---

## 💡 Recommendation

For now, **accept the limitation** and:
1. Make your default `og-image.jpg` really attractive
2. Include your logo and tagline
3. Users will still see the correct info when they click

**OR** invest time in migrating to Next.js for proper SSR.

---

## 📝 Quick Win

Update your `og-image.jpg` to be more descriptive:
- Add text: "Rent Items, Properties & Services"
- Show sample items
- Make it eye-catching

This way, even with the default image, it looks professional!
