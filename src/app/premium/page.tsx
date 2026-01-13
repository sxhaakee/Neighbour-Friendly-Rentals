import { Metadata } from 'next';
import PremiumClient from './client';

export const metadata: Metadata = {
    title: 'Upgrade to Premium | NeighbourFriendly Rentals',
    description: 'Unlock unlimited listings and exclusive features with our Premium Membership.',
};

export default function PremiumPage() {
    return <PremiumClient />;
}
