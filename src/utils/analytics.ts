import ReactGA from 'react-ga4';

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const initGA = () => {
  if (MEASUREMENT_ID && MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.initialize(MEASUREMENT_ID);
    console.log('Google Analytics initialized');
  } else {
    console.log('Google Analytics not configured');
  }
};

export const logPageView = (path: string) => {
  if (MEASUREMENT_ID && MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

export const logEvent = (category: string, action: string, label?: string) => {
  if (MEASUREMENT_ID && MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.event({
      category,
      action,
      label,
    });
  }
};

export const logSearch = (searchTerm: string) => {
  logEvent('Search', 'search_query', searchTerm);
};

export const logItemView = (itemId: string, itemName: string) => {
  logEvent('Item', 'view_item', `${itemName} (${itemId})`);
};

export const logBooking = (itemId: string, itemName: string, price: number) => {
  logEvent('Booking', 'initiate_booking', `${itemName} - ₹${price}`);
};

export const logListingCreated = (category: string) => {
  logEvent('Listing', 'create_listing', category);
};

export const logUserSignup = (method: string) => {
  logEvent('User', 'sign_up', method);
};

export const logUserLogin = (method: string) => {
  logEvent('User', 'login', method);
};
