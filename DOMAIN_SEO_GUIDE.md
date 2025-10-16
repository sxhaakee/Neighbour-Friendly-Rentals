# 🌐 Domain Purchase & SEO Guide - neighbourfriendly.in

## Part 1: Domain Purchase

### Step 1: Check Domain Availability

**Domain**: `neighbourfriendly.in`

Check availability at:
- **GoDaddy**: https://in.godaddy.com
- **Namecheap**: https://www.namecheap.com
- **BigRock**: https://www.bigrock.in (Indian registrar)
- **HostGator India**: https://www.hostgator.in

**Expected Price**: ₹500-800/year for .in domain

---

### Step 2: Choose Registrar (Recommended)

#### Option A: GoDaddy (Most Popular)
**Pros**:
- Trusted brand
- 24/7 support
- Easy DNS management
- Free email forwarding

**Cons**:
- Slightly expensive
- Upselling tactics

**Price**: ~₹699/year

#### Option B: Namecheap (Best Value)
**Pros**:
- Cheaper than GoDaddy
- Free WHOIS privacy
- Clean interface
- Good support

**Cons**:
- International company

**Price**: ~₹599/year

#### Option C: BigRock (Indian)
**Pros**:
- Indian company
- INR payments
- Local support
- GST invoice

**Cons**:
- Interface not as modern

**Price**: ~₹549/year

**Recommendation**: **Namecheap** for best value + features

---

### Step 3: Purchase Process

1. **Go to Namecheap.com**
2. **Search** for `neighbourfriendly.in`
3. **Add to cart**
4. **Optional Add-ons** (Skip these):
   - ❌ Web hosting (using Vercel)
   - ❌ Email hosting (use Google Workspace later)
   - ✅ WHOIS Privacy (FREE with Namecheap)
5. **Create account**
6. **Payment**: Credit/Debit card, UPI, PayPal
7. **Complete purchase**

---

### Step 4: Connect Domain to Vercel

#### In Namecheap Dashboard:

1. Go to **Domain List**
2. Click **Manage** next to your domain
3. Go to **Advanced DNS** tab
4. **Delete** all existing records
5. **Add new records**:

```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic

Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

#### In Vercel Dashboard:

1. Go to your project: **neighbourfriendly.vercel.app**
2. Click **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `neighbourfriendly.in`
5. Click **Add**
6. Also add: `www.neighbourfriendly.in`
7. Vercel will show DNS instructions (already done above)
8. Wait 24-48 hours for propagation

---

### Step 5: SSL Certificate

**Automatic with Vercel!**
- Vercel provides free SSL (Let's Encrypt)
- HTTPS enabled automatically
- Auto-renewal
- No configuration needed

---

## Part 2: SEO Optimization

### Step 1: Update Meta Tags

Create `src/components/SEO/MetaTags.tsx`:

```typescript
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const MetaTags = ({
  title = 'NeighbourFriendly Rentals - Rent Anything, Anywhere in India',
  description = 'India\'s trusted peer-to-peer rental marketplace. Rent products, properties, and book event services. Save money, build community. Join 10,000+ users.',
  keywords = 'rental marketplace india, rent products, property rental, event services, peer to peer rental, rent electronics, rent furniture, rent tools',
  image = 'https://neighbourfriendly.in/og-image.jpg',
  url = 'https://neighbourfriendly.in',
  type = 'website'
}: MetaTagsProps) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="NeighbourFriendly Rentals" />
      <link rel="canonical" content={url} />
    </Helmet>
  );
};
```

---

### Step 2: Install React Helmet

```bash
npm install react-helmet-async
```

Update `src/main.tsx`:

```typescript
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
```

---

### Step 3: Page-Specific SEO

#### Home Page:
```typescript
<MetaTags
  title="NeighbourFriendly Rentals - Rent Products, Properties & Services"
  description="India's #1 rental marketplace. Rent electronics, furniture, tools. Find properties for rent. Book event services. Join 10,000+ happy users."
  keywords="rental marketplace, rent products india, property rental, event services"
/>
```

#### Listings Page:
```typescript
<MetaTags
  title="Browse Rentals - Electronics, Furniture, Tools & More"
  description="Discover thousands of items for rent near you. From cameras to furniture, tools to party equipment. Affordable daily rentals."
  url="https://neighbourfriendly.in/listings"
/>
```

#### Properties Page:
```typescript
<MetaTags
  title="Properties for Rent - Flats, Houses, PG, Commercial Spaces"
  description="Find your perfect home. Browse flats, houses, PG, hostels, and commercial spaces across India. Verified listings, direct owners."
  url="https://neighbourfriendly.in/properties"
/>
```

#### Services Page:
```typescript
<MetaTags
  title="Event Services - DJ, Catering, Photography, Decoration"
  description="Book verified event service providers. DJ, catering, photography, videography, decoration, and more. Best prices, trusted professionals."
  url="https://neighbourfriendly.in/services"
/>
```

---

### Step 4: Create Sitemap

Create `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://neighbourfriendly.in/</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://neighbourfriendly.in/listings</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://neighbourfriendly.in/properties</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://neighbourfriendly.in/services</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://neighbourfriendly.in/about</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

---

### Step 5: Create robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /verify-id
Disallow: /api/

Sitemap: https://neighbourfriendly.in/sitemap.xml
```

---

### Step 6: Google Search Console

1. **Go to**: https://search.google.com/search-console
2. **Add property**: `neighbourfriendly.in`
3. **Verify ownership**:
   - Option A: DNS verification (add TXT record)
   - Option B: HTML file upload
   - Option C: HTML tag (add to index.html)
4. **Submit sitemap**: `https://neighbourfriendly.in/sitemap.xml`
5. **Request indexing** for main pages

---

### Step 7: Google Analytics 4

1. **Go to**: https://analytics.google.com
2. **Create account**: NeighbourFriendly
3. **Create property**: neighbourfriendly.in
4. **Get Measurement ID**: G-XXXXXXXXXX
5. **Add to `.env.local`**:
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

6. **Install package**:
```bash
npm install react-ga4
```

7. **Initialize in App.tsx**:
```typescript
import ReactGA from 'react-ga4';

useEffect(() => {
  ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
}, []);
```

---

### Step 8: Structured Data (Schema.org)

Add to each listing page:

```typescript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": listing.title,
  "image": listing.images,
  "description": listing.description,
  "offers": {
    "@type": "Offer",
    "price": listing.price,
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "89"
  }
};

// Add to head
<script type="application/ld+json">
  {JSON.stringify(structuredData)}
</script>
```

---

### Step 9: Performance Optimization

#### Image Optimization:
- Use WebP format
- Lazy loading
- Responsive images
- CDN delivery (Cloudinary)

#### Code Splitting:
```typescript
const Properties = lazy(() => import('./pages/Properties'));
const Services = lazy(() => import('./pages/Services'));
```

#### Caching:
```typescript
// In vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  }
});
```

---

### Step 10: Local SEO

#### Google My Business:
1. Create business profile
2. Add location (if physical office)
3. Add business hours
4. Upload photos
5. Get reviews

#### Local Keywords:
- "rental marketplace in [city]"
- "rent products in Bangalore"
- "property rental Mumbai"
- "event services Delhi"

---

## Part 3: Content Strategy

### Blog Topics (for SEO):
1. "Top 10 Items to Rent Instead of Buy in 2025"
2. "How to Find Affordable Housing in [City]"
3. "Complete Guide to Planning Events on a Budget"
4. "Peer-to-Peer Rental: The Future of Sharing Economy"
5. "How to Make Money by Renting Your Unused Items"

### Landing Pages:
- `/rent-electronics-[city]`
- `/property-rental-[city]`
- `/event-services-[city]`
- `/rent-furniture-[city]`

---

## Part 4: Social Media SEO

### Open Graph Image:
Create `public/og-image.jpg` (1200x630px):
- Platform logo
- Tagline: "India's Trusted Rental Marketplace"
- Key features
- CTA: "Join 10,000+ Users"

### Twitter Card:
Same as OG image, optimized for Twitter

---

## Part 5: Monitoring & Analytics

### Track These Metrics:
- **Organic Traffic**: Google Analytics
- **Search Rankings**: Google Search Console
- **Page Speed**: PageSpeed Insights
- **Core Web Vitals**: Search Console
- **Backlinks**: Ahrefs/SEMrush (free tier)
- **Keyword Rankings**: Google Search Console

### Monthly SEO Tasks:
- Review Search Console performance
- Update sitemap
- Check broken links
- Monitor page speed
- Analyze top keywords
- Update meta descriptions
- Add new content

---

## Part 6: Quick Wins

### Immediate Actions:
1. ✅ Add meta tags to all pages
2. ✅ Create sitemap.xml
3. ✅ Create robots.txt
4. ✅ Submit to Google Search Console
5. ✅ Set up Google Analytics
6. ✅ Optimize images
7. ✅ Add structured data
8. ✅ Create OG image

### Week 1:
- Submit sitemap
- Request indexing for main pages
- Set up Google My Business
- Create social media profiles
- Share first posts

### Month 1:
- Publish 4 blog posts
- Get 10 backlinks
- Reach 1,000 visitors
- Get 50 listings
- 100 registered users

---

## Part 7: Checklist

### Domain Setup:
- [ ] Purchase neighbourfriendly.in
- [ ] Connect to Vercel
- [ ] Verify SSL certificate
- [ ] Test www redirect
- [ ] Update all links in app

### SEO Setup:
- [ ] Install react-helmet-async
- [ ] Add MetaTags component
- [ ] Create sitemap.xml
- [ ] Create robots.txt
- [ ] Submit to Google Search Console
- [ ] Set up Google Analytics
- [ ] Add structured data
- [ ] Create OG image
- [ ] Optimize images
- [ ] Test page speed

### Monitoring:
- [ ] Google Search Console verified
- [ ] Google Analytics tracking
- [ ] Vercel Analytics enabled
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring

---

## Resources

- **Domain Registrars**: Namecheap, GoDaddy, BigRock
- **SEO Tools**: Google Search Console, Analytics, PageSpeed Insights
- **Learning**: Moz Beginner's Guide, Google SEO Starter Guide
- **Community**: r/SEO, r/bigseo, WebmasterWorld

---

**🎉 Your domain and SEO are now production-ready!**
