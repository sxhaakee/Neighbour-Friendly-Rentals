import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title') || 'NeighbourFriendly Rentals';
    const image = searchParams.get('image');
    const price = searchParams.get('price');
    const type = searchParams.get('type') || 'item';
    const description = searchParams.get('description') || '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: image 
              ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${image})`
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Overlay gradient */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
              padding: '60px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Title */}
            <div 
              style={{ 
                fontSize: 56, 
                fontWeight: 'bold', 
                color: 'white',
                marginBottom: 16,
                lineHeight: 1.2,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {title}
            </div>

            {/* Description */}
            {description && (
              <div 
                style={{ 
                  fontSize: 28, 
                  color: '#e5e7eb',
                  marginBottom: 20,
                  lineHeight: 1.4,
                  maxWidth: '80%',
                }}
              >
                {description.substring(0, 100)}...
              </div>
            )}

            {/* Price and Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {price && (
                <div 
                  style={{ 
                    fontSize: 42, 
                    color: '#fbbf24',
                    fontWeight: 'bold',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }}
                >
                  ₹{price}/day
                </div>
              )}
              
              <div 
                style={{ 
                  fontSize: 24, 
                  color: '#d1d5db',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  padding: '8px 16px',
                  borderRadius: 8,
                }}
              >
                {type === 'item' ? '📦 Item' : type === 'property' ? '🏠 Property' : '🎉 Service'}
              </div>
            </div>

            {/* Branding */}
            <div 
              style={{ 
                fontSize: 24, 
                color: '#9ca3af',
                marginTop: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 32 }}>🏘️</span>
              NeighbourFriendly Rentals
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
