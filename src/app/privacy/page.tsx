import { Metadata } from 'next';
import PrivacyClient from './client';

export const metadata: Metadata = {
    title: 'Privacy Policy | NeighbourFriendly Rentals',
    description: 'Read our privacy policy to understand how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
    return <PrivacyClient />;
}
