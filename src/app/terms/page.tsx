import { Metadata } from 'next';
import TermsClient from './client';

export const metadata: Metadata = {
    title: 'Terms & Conditions | NeighbourFriendly Rentals',
    description: 'Read our terms and conditions for using the NeighbourFriendly Rentals platform.',
};

export default function TermsPage() {
    return <TermsClient />;
}
