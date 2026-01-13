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

export default function ServiceDetailsPage({ params }: { params: { id: string } }) {
    return <ServiceDetailsClient id={params.id} />;
}
