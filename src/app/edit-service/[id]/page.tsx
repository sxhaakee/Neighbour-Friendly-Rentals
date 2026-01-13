import { Metadata } from 'next';
import EditServiceClient from './client';

export const metadata: Metadata = {
    title: 'Edit Service | NeighbourFriendly Rentals',
    description: 'Update your service offering details.',
};

export default function EditServicePage() {
    return <EditServiceClient />;
}
