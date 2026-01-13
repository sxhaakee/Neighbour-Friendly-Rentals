import { Metadata } from 'next';
import HomeClient from './client';

export const metadata: Metadata = {
    title: 'NeighbourFriendly Rentals - Rent from people you can trust',
    description: 'A trust-first rental marketplace with verified users, digital agreements, and local discovery.',
};

export default function HomePage() {
    return <HomeClient />;
}
