import { Metadata } from 'next';
import PropertyDetailsClient from './client';
import { propertyService } from '@/services/propertyService';

// This is a Server Component
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    // Fetch data
    const property = await propertyService.getPropertyById(params.id);

    if (!property) {
        return {
            title: 'Property Not Found | NeighbourFriendly Rentals',
            description: 'The property you are looking for does not exist.',
        };
    }

    return {
        title: `${property.title} | NeighbourFriendly Rentals`,
        description: property.description || 'View this property on NeighbourFriendly Rentals.',
        openGraph: {
            title: property.title,
            description: property.description,
            images: property.images && property.images.length > 0 ? [property.images[0]] : ['https://neighbourfriendly.in/og-image.png'],
            url: `https://neighbourfriendly.in/properties/${property.id}`,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: property.title,
            description: property.description,
            images: property.images && property.images.length > 0 ? [property.images[0]] : ['https://neighbourfriendly.in/og-image.png'],
        },
    };
}

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
    return <PropertyDetailsClient id={params.id} />;
}
