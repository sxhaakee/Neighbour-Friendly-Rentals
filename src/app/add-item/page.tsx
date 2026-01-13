import { Metadata } from 'next';
import AddItemClient from './client';

export const metadata: Metadata = {
    title: 'Add New Item | NeighbourFriendly Rentals',
    description: 'List your items for rent and earn money.',
};

export default function AddItemPage() {
    return <AddItemClient />;
}
