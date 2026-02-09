import { Metadata } from 'next';
import ServiceDetailsClient from './client';
import { serviceProviderService } from '@/services/serviceProviderService';

export const dynamic = 'force-dynamic';

// This is a Server Component
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    // Guard against non-UUID params during build
    if (!params.id || params.id === '[id]' || params.id.length < 32) {
        return {
            title: 'Service Details | NeighbourFriendly Rentals',
        };
    }

    try {
        // Fetch data
        const service = await serviceProviderService.getProviderById(params.id);

        if (!service) {
            return {
                title: 'Service Not Found | NeighbourFriendly Rentals',
                description: 'The service you are looking for does not exist.',
            };
        }

        const serviceImage = service.portfolio_images?.[0] || service.images?.[0] || 'https://neighbourfriendly.in/og-image.png';

        return {
            title: `${service.business_name} | NeighbourFriendly Rentals`,
            description: service.description || 'View this service on NeighbourFriendly Rentals.',
            openGraph: {
                title: service.business_name,
                description: service.description,
                images: [serviceImage],
                url: `https://neighbourfriendly.in/services/${service.id}`,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: service.business_name,
                description: service.description,
                images: [serviceImage],
            },
        };
    } catch (error) {
        console.error('Error generating metadata for service:', error);
        return {
            title: 'Service Details | NeighbourFriendly Rentals',
        };
    }
}

export default async function ServiceDetailsPage({ params }: { params: { id: string } }) {
    const service = await serviceProviderService.getProviderById(params.id);

    if (!service) {
        return <ServiceDetailsClient id={params.id} />;
    }

    const serviceImage = service.portfolio_images?.[0] || service.images?.[0] || 'https://neighbourfriendly.in/og-image.png';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.business_name,
        description: service.description,
        image: serviceImage,
        provider: {
            '@type': 'LocalBusiness',
            name: service.business_name,
            image: service.logo_url,
            telephone: service.phone,
            email: service.email,
            address: {
                '@type': 'PostalAddress',
                addressLocality: service.city,
                addressRegion: service.state,
            },
            priceRange: service.price_range_min && service.price_range_max ? `₹${service.price_range_min} - ₹${service.price_range_max}` : (service.base_price ? `₹${service.base_price}` : 'Msg for Price'),
        },
        offers: {
            '@type': 'Offer',
            price: service.base_price || 0,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ServiceDetailsClient id={params.id} />
        </>
    );
}
