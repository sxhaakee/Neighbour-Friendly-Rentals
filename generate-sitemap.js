// Generate sitemap.xml for SEO
// Run this script: node generate-sitemap.js

import fs from 'fs';

const baseUrl = 'https://neighbourfriendly.in';

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/listings', priority: '0.9', changefreq: 'daily' },
  { url: '/services', priority: '0.9', changefreq: 'daily' },
  { url: '/properties', priority: '0.9', changefreq: 'daily' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/premium', priority: '0.8', changefreq: 'weekly' },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  // Add static pages
  staticPages.forEach(page => {
    sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  // Write to public folder
  fs.writeFileSync('./public/sitemap.xml', sitemap);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
  console.log(`📄 Total URLs: ${staticPages.length}`);
  console.log('\n📋 Next steps:');
  console.log('1. Upload sitemap.xml to your server');
  console.log('2. Submit to Google Search Console: https://search.google.com/search-console');
  console.log('3. Submit to Bing Webmaster Tools: https://www.bing.com/webmasters');
}

generateSitemap();
