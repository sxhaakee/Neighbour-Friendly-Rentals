// Google Analytics 4 Integration
// Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-HTX0NE9DQ0'; // Replace with your GA4 ID

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined') return;

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window.gtag === 'undefined') return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag === 'undefined') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track booking events
export const trackBooking = (itemId: string, itemName: string, price: number) => {
  trackEvent('booking_created', 'Bookings', itemName, price);
  
  // E-commerce tracking
  if (typeof window.gtag === 'undefined') return;
  
  window.gtag('event', 'purchase', {
    transaction_id: `booking_${Date.now()}`,
    value: price,
    currency: 'INR',
    items: [{
      item_id: itemId,
      item_name: itemName,
      price: price,
      quantity: 1,
    }],
  });
};

// Track listing views
export const trackListingView = (itemId: string, itemName: string, category: string) => {
  trackEvent('view_item', 'Listings', itemName);
  
  if (typeof window.gtag === 'undefined') return;
  
  window.gtag('event', 'view_item', {
    items: [{
      item_id: itemId,
      item_name: itemName,
      item_category: category,
    }],
  });
};

// Track search
export const trackSearch = (searchTerm: string) => {
  trackEvent('search', 'Search', searchTerm);
};

// Track user signup
export const trackSignup = (method: string) => {
  trackEvent('sign_up', 'User', method);
};

// Track user login
export const trackLogin = (method: string) => {
  trackEvent('login', 'User', method);
};

// Track add to favorites
export const trackAddToFavorites = (itemId: string, itemName: string) => {
  trackEvent('add_to_wishlist', 'Favorites', itemName);
};

// Track share
export const trackShare = (itemId: string, itemName: string, method: string) => {
  trackEvent('share', 'Social', `${itemName} - ${method}`);
};

// Track errors
export const trackError = (errorMessage: string, errorLocation: string) => {
  trackEvent('error', 'Errors', `${errorLocation}: ${errorMessage}`);
};

// Track form submissions
export const trackFormSubmission = (formName: string) => {
  trackEvent('form_submit', 'Forms', formName);
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('button_click', 'Engagement', `${location} - ${buttonName}`);
};

// Track time on page
export const trackTimeOnPage = (pageName: string, timeInSeconds: number) => {
  trackEvent('time_on_page', 'Engagement', pageName, timeInSeconds);
};

// Track scroll depth
export const trackScrollDepth = (depth: number) => {
  trackEvent('scroll_depth', 'Engagement', `${depth}%`, depth);
};

// Track video plays (for item videos)
export const trackVideoPlay = (videoId: string, videoName: string) => {
  trackEvent('video_play', 'Media', videoName);
};

// Track file downloads (for agreements)
export const trackDownload = (fileName: string, fileType: string) => {
  trackEvent('file_download', 'Downloads', `${fileName} (${fileType})`);
};

// Track outbound links
export const trackOutboundLink = (url: string, label: string) => {
  trackEvent('outbound_link', 'Navigation', label);
};

// User properties
export const setUserProperties = (userId: string, properties: { [key: string]: any }) => {
  if (typeof window.gtag === 'undefined') return;
  
  window.gtag('set', 'user_properties', {
    user_id: userId,
    ...properties,
  });
};

// Track user type
export const setUserType = (userType: 'renter' | 'owner' | 'both' | 'admin') => {
  if (typeof window.gtag === 'undefined') return;
  
  window.gtag('set', 'user_properties', {
    user_type: userType,
  });
};

// Track premium status
export const setPremiumStatus = (isPremium: boolean) => {
  if (typeof window.gtag === 'undefined') return;
  
  window.gtag('set', 'user_properties', {
    premium_user: isPremium,
  });
};
