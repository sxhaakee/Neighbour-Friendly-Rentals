# 🌐 Domain Setup & SEO Guide for neighbourfriendly.in

## 📋 Table of Contents
1. [Domain Configuration](#domain-configuration)
2. [Vercel Deployment Setup](#vercel-deployment-setup)
3. [Google Analytics Setup](#google-analytics-setup)
4. [SEO Optimization](#seo-optimization)
5. [SSL Certificate](#ssl-certificate)
6. [Performance Optimization](#performance-optimization)

---

## 🔧 Domain Configuration

### Step 1: Configure DNS Settings

Go to your domain registrar (where you bought `neighbourfriendly.in`) and add these DNS records:

#### A Records (for root domain)
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

#### CNAME Records (for www subdomain)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

**Note**: DNS propagation can take 24-48 hours, but usually completes within 1-2 hours.

---

## 🚀 Vercel Deployment Setup

### Step 1: Add Domain to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **NFRR**
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `neighbourfriendly.in`
6. Click **Add**
7. Repeat for: `www.neighbourfriendly.in`

### Step 2: Verify Domain

Vercel will show you the DNS records to add. Follow the instructions and wait for verification.

### Step 3: Set Primary Domain

1. In Vercel Domains settings
2. Click the three dots next to `neighbourfriendly.in`
3. Select **Set as Primary Domain**
4. This will redirect `www.neighbourfriendly.in` → `neighbourfriendly.in`

### Step 4: Enable HTTPS

Vercel automatically provisions SSL certificates. Just ensure:
- ✅ **HTTPS Redirect** is enabled
- ✅ **SSL Certificate** shows as "Active"

---

## 📊 Google Analytics Setup

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (bottom left)
3. Click **Create Property**
4. Enter:
   - Property name: `NeighbourFriendly Rentals`
   - Reporting time zone: `India Standard Time`
   - Currency: `Indian Rupee (₹)`
5. Click **Next**
6. Fill business information
7. Click **Create**

### Step 2: Get Measurement ID

1. After creating property, go to **Data Streams**
2. Click **Add stream** → **Web**
3. Enter:
   - Website URL: `https://neighbourfriendly.in`
   - Stream name: `NeighbourFriendly Web`
4. Click **Create stream**
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Update Code

Open `/src/utils/googleAnalytics.ts` and replace:

```typescript
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual ID
```

With your actual Measurement ID:

```typescript
export const GA_MEASUREMENT_ID = 'G-ABC123DEF4'; // Your actual ID
```

### Step 4: Verify Installation

1. Deploy the changes to Vercel
2. Visit your website
3. Open Google Analytics
4. Go to **Reports** → **Realtime**
5. You should see yourself as an active user!

---

## 🎯 SEO Optimization

### Step 1: Update Meta Tags

Create `/public/index.html` or update existing with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>NeighbourFriendly Rentals - Rent & Share Items, Properties & Services</title>
  <meta name="title" content="NeighbourFriendly Rentals - Rent & Share Items, Properties & Services">
  <meta name="description" content="India's trusted peer-to-peer rental marketplace. Rent items, properties, and services from your neighbors. Save money, reduce waste, build community.">
  <meta name="keywords" content="rental marketplace, peer-to-peer rentals, rent items, rent properties, rent services, sharing economy, India rentals, neighbourfriendly">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://neighbourfriendly.in/">
  <meta property="og:title" content="NeighbourFriendly Rentals - Rent & Share Items, Properties & Services">
  <meta property="og:description" content="India's trusted peer-to-peer rental marketplace. Rent items, properties, and services from your neighbors.">
  <meta property="og:image" content="https://neighbourfriendly.in/og-image.jpg">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://neighbourfriendly.in/">
  <meta property="twitter:title" content="NeighbourFriendly Rentals - Rent & Share Items, Properties & Services">
  <meta property="twitter:description" content="India's trusted peer-to-peer rental marketplace. Rent items, properties, and services from your neighbors.">
  <meta property="twitter:image" content="https://neighbourfriendly.in/og-image.jpg">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://neighbourfriendly.in/">
  
  <!-- Robots -->
  <meta name="robots" content="index, follow">
  <meta name="googlebot" content="index, follow">
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### Step 2: Create robots.txt

Create `/public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard

Sitemap: https://neighbourfriendly.in/sitemap.xml
```

### Step 3: Create sitemap.xml

Create `/public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://neighbourfriendly.in/</loc>
    <lastmod>2025-10-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://neighbourfriendly.in/listings</loc>
    <lastmod>2025-10-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://neighbourfriendly.in/properties</loc>
    <lastmod>2025-10-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://neighbourfriendly.in/services</loc>
    <lastmod>2025-10-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://neighbourfriendly.in/about</loc>
    <lastmod>2025-10-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### Step 4: Submit to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add Property**
3. Enter: `https://neighbourfriendly.in`
4. Verify ownership (use DNS verification)
5. Submit sitemap: `https://neighbourfriendly.in/sitemap.xml`

---

## 🔒 SSL Certificate

Vercel automatically provides SSL certificates via Let's Encrypt. No action needed!

**Verify SSL**:
1. Visit `https://neighbourfriendly.in`
2. Click the padlock icon in browser
3. Should show "Connection is secure"

---

## ⚡ Performance Optimization

### Already Implemented:
- ✅ Code splitting with React lazy loading
- ✅ Image optimization
- ✅ Gzip compression (Vercel default)
- ✅ CDN delivery (Vercel Edge Network)
- ✅ Caching headers

### Additional Optimizations:

#### 1. Enable Vercel Analytics
```bash
npm install @vercel/analytics
```

Already added in code! Just deploy.

#### 2. Add Structured Data (JSON-LD)

Add to each listing page:

```javascript
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Item Name",
  "image": "https://neighbourfriendly.in/image.jpg",
  "description": "Item description",
  "offers": {
    "@type": "Offer",
    "price": "499",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

---

## 📈 Post-Launch Checklist

### Immediate (Day 1):
- [ ] Verify domain is accessible
- [ ] Check HTTPS is working
- [ ] Test all pages load correctly
- [ ] Verify Google Analytics is tracking
- [ ] Submit sitemap to Google Search Console

### Week 1:
- [ ] Monitor Google Analytics for traffic
- [ ] Check Search Console for indexing status
- [ ] Test booking flow end-to-end
- [ ] Monitor error logs in Vercel
- [ ] Check mobile responsiveness

### Week 2:
- [ ] Review SEO performance
- [ ] Analyze user behavior in GA
- [ ] Optimize slow pages
- [ ] Add more content for SEO
- [ ] Start social media marketing

---

## 🎉 Launch Announcement

### Social Media Posts:

**Twitter/X:**
```
🚀 Excited to launch NeighbourFriendly Rentals!

Rent items, properties & services from your neighbors.
💰 Save money
♻️ Reduce waste
🤝 Build community

Visit: https://neighbourfriendly.in

#SharingEconomy #PeerToPeer #IndiaStartup
```

**LinkedIn:**
```
I'm thrilled to announce the launch of NeighbourFriendly Rentals - India's peer-to-peer rental marketplace!

Our platform enables neighbors to rent items, properties, and services from each other, promoting:
✅ Cost savings
✅ Sustainability
✅ Community building

Check it out: https://neighbourfriendly.in

#Entrepreneurship #SharingEconomy #Sustainability
```

---

## 🆘 Troubleshooting

### Domain not working?
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Clear browser cache
- Try incognito mode

### SSL certificate error?
- Wait a few minutes for Vercel to provision
- Check domain is verified in Vercel
- Contact Vercel support if issue persists

### Google Analytics not tracking?
- Check Measurement ID is correct
- Verify gtag script is loading (check Network tab)
- Disable ad blockers for testing
- Wait 24 hours for data to appear

---

## 📞 Support

- **Vercel Support**: https://vercel.com/support
- **Google Analytics Help**: https://support.google.com/analytics
- **Domain Registrar**: Contact your domain provider

---

**Good luck with your launch! 🚀**
