import { Metadata } from 'next';
import MessagesClient from '../client';

export const metadata: Metadata = {
    title: 'Chat | NeighbourFriendly Rentals',
    description: 'Chat details.',
};

export default function MessageDetailPage() {
    return <MessagesClient />;
}
