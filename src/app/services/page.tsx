import { Metadata } from 'next';
import ServicesClient from './client';

export const metadata: Metadata = {
    title: 'Find Services | NeighbourFriendly Rentals',
    description: 'Connect with local service providers for your events and needs.',
};

export default function ServicesPage() {
    return <ServicesClient />;
}
