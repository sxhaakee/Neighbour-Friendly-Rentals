import { Metadata } from 'next';
import EditItemClient from './client';

export const metadata: Metadata = {
    title: 'Edit Item | NeighbourFriendly Rentals',
    description: 'Update your rental item details.',
};

export default function EditItemPage() {
    return <EditItemClient />;
}
