import { Metadata } from 'next';
import AboutClient from './client';

export const metadata: Metadata = {
    title: 'About Us | NeighbourFriendly Rentals',
    description: 'Learn about our mission to bring neighbourhoods back to life through trust and sharing.',
};

export default function AboutPage() {
    return <AboutClient />;
}
