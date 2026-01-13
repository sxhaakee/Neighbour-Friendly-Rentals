import { Metadata } from 'next';
import BookItemClient from './client';

export const metadata: Metadata = {
    title: 'Book Item | NeighbourFriendly Rentals',
    description: 'Complete your booking securely.',
};

export default function BookItemPage() {
    return <BookItemClient />;
}
