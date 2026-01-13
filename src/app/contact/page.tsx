import { Metadata } from 'next';
import ContactClient from './client';

export const metadata: Metadata = {
    title: 'Contact Us | NeighbourFriendly Rentals',
    description: 'Get in touch with us for support, feedback, or inquiries.',
};

export default function ContactPage() {
    return <ContactClient />;
}
