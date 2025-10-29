import { useEffect } from 'react';

interface GoogleAdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Google AdSense Component
 * 
 * Usage:
 * <GoogleAd slot="1234567890" format="auto" />
 * 
 * Ad Slots:
 * - Homepage Banner: slot="1234567890"
 * - Sidebar: slot="0987654321"
 * - Listing Details: slot="1122334455"
 * - Between Listings: slot="5544332211"
 */
export const GoogleAd = ({
  slot,
  format = 'auto',
  responsive = true,
  style,
  className = '',
}: GoogleAdProps) => {
  useEffect(() => {
    try {
      // Push ad to AdSense
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`google-ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-1300897517747545"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};

/**
 * Native Ad Component (Blends with content)
 */
export const NativeAd = () => {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 my-6">
      <span className="text-xs text-gray-500 mb-2 block">Sponsored</span>
      <GoogleAd 
        slot="NATIVE_AD_SLOT" 
        format="fluid"
        className="min-h-[200px]"
      />
    </div>
  );
};

/**
 * Sidebar Ad Component
 */
export const SidebarAd = () => {
  return (
    <div className="sticky top-24">
      <GoogleAd 
        slot="SIDEBAR_SLOT" 
        format="vertical"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
};

/**
 * Banner Ad Component
 */
export const BannerAd = () => {
  return (
    <div className="w-full my-8">
      <GoogleAd 
        slot="BANNER_SLOT" 
        format="horizontal"
        style={{ minHeight: '90px' }}
      />
    </div>
  );
};

/**
 * In-Feed Ad Component (Between listings)
 */
export const InFeedAd = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 my-4">
      <span className="text-xs text-gray-500 mb-2 block">Advertisement</span>
      <GoogleAd 
        slot="IN_FEED_SLOT" 
        format="fluid"
        style={{ minHeight: '250px' }}
      />
    </div>
  );
};

export default GoogleAd;
