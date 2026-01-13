import { Metadata } from 'next';
import PropertiesClient from './client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Find Properties | NeighbourFriendly Rentals',
    description: 'Search for flats, houses, PGs, and commercial spaces for rent.',
};

export default function PropertiesPage() {
    return <PropertiesClient />;
}
