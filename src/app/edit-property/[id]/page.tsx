import { Metadata } from 'next';
import EditPropertyClient from './client';

export const metadata: Metadata = {
    title: 'Edit Property | NeighbourFriendly Rentals',
    description: 'Update your property listing details.',
};

export default function EditPropertyPage() {
    return <EditPropertyClient />;
}
