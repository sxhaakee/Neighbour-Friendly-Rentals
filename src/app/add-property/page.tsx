import { Metadata } from 'next';
import AddPropertyClient from './client';

export const metadata: Metadata = {
    title: 'Add New Property | NeighbourFriendly Rentals',
    description: 'List your property for rent and find the best tenants.',
};

export default function AddPropertyPage() {
    return <AddPropertyClient />;
}
