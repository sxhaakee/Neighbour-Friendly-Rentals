import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/nfr-control/', '/profile/', '/dashboard/', '/messages/'],
    },
    sitemap: 'https://neighbourfriendly.in/sitemap.xml',
  };
}
