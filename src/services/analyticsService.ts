import ReactGA from 'react-ga4';

export const analyticsService = {
  initialize() {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId && import.meta.env.PROD) {
      ReactGA.initialize(measurementId);
    }
  },

  pageView(path: string) {
    ReactGA.send({ hitType: 'pageview', page: path });
  },

  event(category: string, action: string, label?: string) {
    ReactGA.event({ category, action, label });
  },
};