import { MetadataRoute } from 'next';
import { listingService } from '@/services/listingService';
import { propertyService } from '@/services/propertyService';
import { serviceProviderService } from '@/services/serviceProviderService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://neighbourfriendly.in';

  // Static routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/login',
    '/add-item',
    '/add-property',
    '/add-service',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  try {
    // Dynamic routes: Items
    const items = await listingService.getApprovedListings();
    const itemRoutes = items.map((item: any) => ({
      url: `${baseUrl}/items/${item.id}`,
      lastModified: new Date(item.updated_at || item.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Dynamic routes: Properties
    const properties = await propertyService.getApprovedProperties();
    const propertyRoutes = properties.map((property: any) => ({
      url: `${baseUrl}/properties/${property.id}`,
      lastModified: new Date(property.updated_at || property.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Dynamic routes: Services
    const services = await serviceProviderService.getApprovedProviders();
    const serviceRoutes = services.map((service: any) => ({
      url: `${baseUrl}/services/${service.id}`,
      lastModified: new Date(service.updated_at || service.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...routes, ...itemRoutes, ...propertyRoutes, ...serviceRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
