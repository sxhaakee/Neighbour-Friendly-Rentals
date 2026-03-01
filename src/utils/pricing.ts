/**
 * Pricing Utility Functions
 * Handles pricing model formatting and display
 */

/**
 * Format pricing model for display
 * @param pricingModel - The pricing model (per_day, per_week, etc.)
 * @returns Formatted string for display
 */
export const formatPricingModel = (pricingModel?: string | null): string => {
  if (!pricingModel) return '/day';
  
  const modelMap: Record<string, string> = {
    'per_day': '/day',
    'per-day': '/day',
    'per_week': '/week',
    'per-week': '/week',
    'per_month': '/month',
    'per-month': '/month',
    'per_event': '/event',
    'per-event': '/event',
    'per_hour': '/hour',
    'per-hour': '/hour',
    'package': ' (Package)',
    'custom': ' (Custom)',
  };
  
  return modelMap[pricingModel] || '/day';
};

/**
 * Get full pricing model label
 * @param pricingModel - The pricing model
 * @returns Full label (e.g., "Per Day")
 */
export const getPricingModelLabel = (pricingModel?: string): string => {
  if (!pricingModel) return 'Per Day';
  
  const labelMap: Record<string, string> = {
    'per_day': 'Per Day',
    'per-day': 'Per Day',
    'per_week': 'Per Week',
    'per-week': 'Per Week',
    'per_month': 'Per Month',
    'per-month': 'Per Month',
    'per_event': 'Per Event',
    'per-event': 'Per Event',
    'per_hour': 'Per Hour',
    'per-hour': 'Per Hour',
    'package': 'Package',
    'custom': 'Custom Quote',
  };
  
  return labelMap[pricingModel] || 'Per Day';
};

/**
 * Format price with pricing model
 * @param price - The price amount
 * @param pricingModel - The pricing model
 * @returns Formatted price string (e.g., "₹500/day")
 */
export const formatPriceWithModel = (price: number, pricingModel?: string): string => {
  return `₹${price.toLocaleString('en-IN')}${formatPricingModel(pricingModel)}`;
};
