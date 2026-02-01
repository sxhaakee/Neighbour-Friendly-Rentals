import { Metadata } from 'next';
import ListingsClient from './client';

export const metadata: Metadata = {
    title: 'Browse Listings - Items, Services & Properties | NFR',
    description: 'Browse all available items, services, and properties for rent near you. Find cameras, tools, professional services, and rental properties in your neighborhood.',
};

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function ListingsPage() {
    return <ListingsClient />;
}
