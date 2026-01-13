import { Metadata } from 'next';
import DashboardClient from './client';

export const metadata: Metadata = {
    title: 'Dashboard | NeighbourFriendly Rentals',
    description: 'Manage your listings, bookings, and earnings.',
};

export default function DashboardPage() {
    return <DashboardClient />;
}
