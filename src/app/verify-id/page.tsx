import { Metadata } from 'next';
import VerifyIDClient from './client';

export const metadata: Metadata = {
    title: 'Verify Identity | NeighbourFriendly Rentals',
    description: 'Upload your ID documents to verify your identity and start renting safely.',
};

export default function VerifyIDPage() {
    return <VerifyIDClient />;
}
