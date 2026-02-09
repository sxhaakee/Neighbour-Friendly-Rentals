import { Metadata } from 'next';
import ItemDetailsClient from './client';
import { listingService } from '@/services/listingService';

export const dynamic = 'force-dynamic';

// This is a Server Component
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Guard against non-UUID params during build
  if (!params.id || params.id === '[id]' || params.id.length < 32) {
    return {
      title: 'Item Details | NeighbourFriendly Rentals',
    };
  }

  try {
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
        url: `https://neighbourfriendly.in/items/${listing.id}`,
        type: 'website', // Use 'website' or 'product'
      },
      twitter: {
        card: 'summary_large_image',
        title: listing.title,
        description: listing.description,
        images: listing.images && listing.images.length > 0 ? [listing.images[0]] : ['https://neighbourfriendly.in/og-image.png'],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for item:', error);
    return {
      title: 'Item Details | NeighbourFriendly Rentals',
    };
  }
}

export default async function ItemDetailsPage({ params }: { params: { id: string } }) {
  const listing = await listingService.getListingById(params.id);

  if (!listing) {
    return <ItemDetailsClient id={params.id} />;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.images,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ItemDetailsClient id={params.id} />
    </>
  );
}
