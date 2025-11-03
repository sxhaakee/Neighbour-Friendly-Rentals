/**
 * WhatsApp Utility Functions
 * Handles phone number formatting and WhatsApp link generation
 */

/**
 * Format phone number for WhatsApp
 * Removes +, spaces, dashes, and ensures it starts with country code
 * @param phone - Phone number (can include +91, spaces, dashes)
 * @returns Formatted phone number for WhatsApp (e.g., 919876543210)
 */
export const formatWhatsAppNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove + sign
  cleaned = cleaned.replace(/\+/g, '');
  
  // If number starts with 91 (India), keep it
  // If number is 10 digits, add 91
  if (cleaned.startsWith('91')) {
    return cleaned;
  } else if (cleaned.length === 10) {
    return '91' + cleaned;
  }
  
  return cleaned;
};

/**
 * Generate WhatsApp link with pre-filled message
 * @param phone - Phone number
 * @param itemType - Type of item (service, property, listing)
 * @param itemTitle - Title of the item
 * @returns WhatsApp URL with pre-filled message
 */
export const generateWhatsAppLink = (
  phone: string,
  itemType: 'service' | 'property' | 'listing' = 'service',
  itemTitle?: string
): string => {
  const formattedNumber = formatWhatsAppNumber(phone);
  
  if (!formattedNumber) return '';
  
  // Create pre-filled message
  let message = `Hi! I found you through NeighbourFriendly Rentals`;
  
  if (itemTitle) {
    message += ` and I'm interested in your ${itemType}: "${itemTitle}"`;
  } else {
    message += ` and I'm interested in your ${itemType}`;
  }
  
  message += `. Could you please provide more details?`;
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Return WhatsApp URL
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
};

/**
 * Open WhatsApp chat
 * @param phone - Phone number
 * @param itemType - Type of item
 * @param itemTitle - Title of the item
 */
export const openWhatsApp = (
  phone: string,
  itemType: 'service' | 'property' | 'listing' = 'service',
  itemTitle?: string
): void => {
  const link = generateWhatsAppLink(phone, itemType, itemTitle);
  if (link) {
    window.open(link, '_blank');
  }
};
