import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { rateLimit } from '@/lib/rateLimit';

const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const { isRateLimited } = limiter.check(5, ip); // 5 requests per hour since it's cached anyway
        
        if (isRateLimited) {
            return new NextResponse('Rate limit exceeded', { status: 429 });
        }

        console.log('[Product Feed] Starting feed generation...');
        
        // Initialize with empty arrays for testing
        let items: any[] = [];
        let services: any[] = [];
        let properties: any[] = [];

        // Try to fetch from Supabase, but don't fail if it doesn't work
        try {
            console.log('[Product Feed] Attempting to fetch from Supabase...');
            const [itemsRes, servicesRes, propertiesRes] = await Promise.all([
                supabaseServer.from('listings').select('*').eq('status', 'approved').limit(100),
                supabaseServer.from('service_providers').select('*').eq('status', 'approved').limit(100),
                supabaseServer.from('properties').select('*').eq('status', 'approved').limit(100),
            ]);

            if (!itemsRes.error && itemsRes.data) {
                items = itemsRes.data;
                console.log(`[Product Feed] Fetched ${items.length} items`);
            } else {
                console.warn('[Product Feed] Error fetching items:', itemsRes.error);
            }

            if (!servicesRes.error && servicesRes.data) {
                services = servicesRes.data;
                console.log(`[Product Feed] Fetched ${services.length} services`);
            } else {
                console.warn('[Product Feed] Error fetching services:', servicesRes.error);
            }

            if (!propertiesRes.error && propertiesRes.data) {
                properties = propertiesRes.data;
                console.log(`[Product Feed] Fetched ${properties.length} properties`);
            } else {
                console.warn('[Product Feed] Error fetching properties:', propertiesRes.error);
            }
        } catch (dbError: any) {
            console.error('[Product Feed] Database fetch error:', dbError.message);
            // Continue with empty arrays - feed will still be valid
        }

        console.log(`[Product Feed] Generating feed with ${items.length} items, ${services.length} services, ${properties.length} properties`);

        // Generate XML feed following Google Merchant Center specification
        const xmlFeed = generateProductFeedXML(items, services, properties);

        console.log('[Product Feed] Feed generated successfully, length:', xmlFeed.length);

        return new NextResponse(xmlFeed, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error: any) {
        console.error('Error generating product feed:', error);
        
        // Return a more detailed error for debugging
        return NextResponse.json({ 
            error: 'Failed to generate feed',
            message: error.message || 'Unknown error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

function generateProductFeedXML(items: any[], services: any[], properties: any[]): string {
    const baseUrl = 'https://neighbourfriendly.in';
    
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>NeighbourFriendly - Rental Marketplace</title>
    <link>${baseUrl}</link>
    <description>Rent items, book services, and find properties near you</description>`;

    const xmlFooter = `
  </channel>
</rss>`;

    let xmlItems = '';

    // Add Items
    items.forEach((item) => {
        const imageUrl = item.images?.[0] || `${baseUrl}/logo.png`;
        const price = item.price || 0;
        const pricingModel = item.pricing_model || 'day';
        
        xmlItems += `
    <item>
      <g:id>item_${item.id}</g:id>
      <g:title>${escapeXml(item.title || 'Untitled Item')}</g:title>
      <g:description>${escapeXml(item.description || 'No description available')}</g:description>
      <g:link>${baseUrl}/items/${item.id}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>${item.condition || 'used'}</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${price} INR</g:price>
      <g:brand>NeighbourFriendly</g:brand>
      <g:product_type>${escapeXml(item.category || 'General')}</g:product_type>
      <g:google_product_category>Rental &gt; ${escapeXml(item.category || 'General')}</g:google_product_category>
      <g:custom_label_0>Items</g:custom_label_0>
      <g:custom_label_1>${pricingModel}</g:custom_label_1>
    </item>`;
    });

    // Add Services
    services.forEach((service) => {
        const imageUrl = service.images?.[0] || `${baseUrl}/logo.png`;
        const price = service.pricing_min || 0;
        
        xmlItems += `
    <item>
      <g:id>service_${service.id}</g:id>
      <g:title>${escapeXml(service.business_name || 'Untitled Service')}</g:title>
      <g:description>${escapeXml(service.description || 'No description available')}</g:description>
      <g:link>${baseUrl}/services/${service.id}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${price} INR</g:price>
      <g:brand>${escapeXml(service.business_name || 'NeighbourFriendly')}</g:brand>
      <g:product_type>${escapeXml(service.category || 'Services')}</g:product_type>
      <g:google_product_category>Services &gt; ${escapeXml(service.category || 'General')}</g:google_product_category>
      <g:custom_label_0>Services</g:custom_label_0>
    </item>`;
    });

    // Add Properties
    properties.forEach((property) => {
        const imageUrl = property.images?.[0] || `${baseUrl}/logo.png`;
        const rent = property.rent_amount || 0;
        
        xmlItems += `
    <item>
      <g:id>property_${property.id}</g:id>
      <g:title>${escapeXml(property.title || 'Untitled Property')}</g:title>
      <g:description>${escapeXml(property.description || 'No description available')}</g:description>
      <g:link>${baseUrl}/properties/${property.id}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${rent} INR</g:price>
      <g:brand>NeighbourFriendly</g:brand>
      <g:product_type>${escapeXml(property.property_type || 'Rental Property')}</g:product_type>
      <g:google_product_category>Real Estate &gt; ${escapeXml(property.property_type || 'Property')}</g:google_product_category>
      <g:custom_label_0>Properties</g:custom_label_0>
      <g:custom_label_1>${property.city || 'Unknown'}</g:custom_label_1>
    </item>`;
    });

    return xmlHeader + xmlItems + xmlFooter;
}

function escapeXml(text: string): string {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .trim()
        .substring(0, 500); // Limit length for Google
}
