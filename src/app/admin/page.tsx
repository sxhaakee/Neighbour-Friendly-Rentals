import { Metadata } from 'next';
import AdminClient from './client';

export const metadata: Metadata = {
    title: 'Admin Dashboard | NeighbourFriendly Rentals',
    description: 'Manage listings, users, and platform activity.',
};

export default function AdminPage() {
    return <AdminClient />;
}
