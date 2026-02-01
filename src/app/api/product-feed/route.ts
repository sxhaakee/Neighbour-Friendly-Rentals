import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch all approved listings, services, and properties
        const [itemsRes, servicesRes, propertiesRes] = await Promise.all([
            supabase.from('listings').select('*').eq('status', 'approved'),
            supabase.from('service_providers').select('*').eq('status', 'approved'),
            supabase.from('properties').select('*').eq('status', 'approved'),
        ]);

        const items = itemsRes.data || [];
        const services = servicesRes.data || [];
        const properties = propertiesRes.data || [];

        // Generate XML feed following Google Merchant Center specification
        const xmlFeed = generateProductFeedXML(items, services, properties);

        return new NextResponse(xmlFeed, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Error generating product feed:', error);
        return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
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
