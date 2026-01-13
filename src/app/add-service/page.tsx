import { Metadata } from 'next';
import AddServiceClient from './client';

export const metadata: Metadata = {
    title: 'Add New Service | NeighbourFriendly Rentals',
    description: 'Offer your professional services and grow your business.',
};

export default function AddServicePage() {
    return <AddServiceClient />;
}
