import { Metadata } from 'next';
import ItemDetailsClient from './client';
import { listingService } from '@/services/listingService';

// This is a Server Component
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch data
  const listing = await listingService.getListingById(params.id);

  if (!listing) {
    return {
      title: 'Item Not Found | NeighbourFriendly Rentals',
      description: 'The item you are looking for does not exist.',
    };
  }

  return {
    title: `${listing.title} | NeighbourFriendly Rentals`,
    description: listing.description || 'Rent this item on NeighbourFriendly Rentals.',
    openGraph: {
      title: listing.title,
      description: listing.description,
      images: listing.images && listing.images.length > 0 ? [listing.images[0]] : ['https://neighbourfriendly.in/og-image.png'],
      url: `https://neighbourfriendly.in/item/${listing.id}`,
      type: 'website', // Use 'website' or 'product'
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description: listing.description,
      images: listing.images && listing.images.length > 0 ? [listing.images[0]] : ['https://neighbourfriendly.in/og-image.png'],
    },
  };
}

export default function ItemDetailsPage({ params }: { params: { id: string } }) {
  return <ItemDetailsClient id={params.id} />;
}
