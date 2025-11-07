/**
 * Dynamic Meta Tags Utility
 * Generates Open Graph and Twitter Card meta tags for social media sharing
 */

interface MetaTagsOptions {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article' | 'product';
  price?: number;
  currency?: string;
}

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

  // Open Graph tags
  setMetaTag('og:title', title);
  setMetaTag('og:description', description);
  setMetaTag('og:image', image);
  setMetaTag('og:image:width', '1200');
  setMetaTag('og:image:height', '630');
  setMetaTag('og:image:alt', title);
  setMetaTag('og:url', url);
  setMetaTag('og:type', type);
  setMetaTag('og:site_name', 'NeighbourFriendly Rentals');
  setMetaTag('og:locale', 'en_IN');

  // Twitter Card tags
  setMetaTag('twitter:card', 'summary_large_image', true);
  setMetaTag('twitter:title', title, true);
  setMetaTag('twitter:description', description, true);
  setMetaTag('twitter:image', image, true);
  setMetaTag('twitter:image:alt', title, true);
  setMetaTag('twitter:url', url, true);

  // Product-specific tags (for items, properties, services)
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

// Reset to default meta tags
export const resetMetaTags = () => {
  updateMetaTags({
    title: 'NeighbourFriendly Rentals',
    description: 'India\'s trusted peer-to-peer rental marketplace. Rent items, properties, and services from your neighbors.',
    image: 'https://neighbourfriendly.in/og-image.png',
    url: 'https://neighbourfriendly.in',
    type: 'website'
  });
};
