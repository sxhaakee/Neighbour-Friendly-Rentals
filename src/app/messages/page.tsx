import { Metadata } from 'next';
import MessagesClient from './client';

export const metadata: Metadata = {
    title: 'Messages | NeighbourFriendly Rentals',
    description: 'Chat with other users about rentals.',
};

export default function MessagesPage() {
    return <MessagesClient />;
}
