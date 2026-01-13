import { Metadata } from 'next';
import ServiceDetailsClient from './client';
import { serviceProviderService } from '@/services/serviceProviderService';

// This is a Server Component
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
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
}

export default function ServiceDetailsPage({ params }: { params: { id: string } }) {
    return <ServiceDetailsClient id={params.id} />;
}
