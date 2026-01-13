import { Metadata } from 'next';
import ItemsClient from './client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Browse Items | NeighbourFriendly Rentals',
    description: 'Explore a wide range of items available for rent in your neighborhood.',
};

export default function ItemsPage() {
    return <ItemsClient />;
}
