/**
 * AI Chat Service using Hugging Face API
 * Provides intelligent, context-aware responses for NeighbourFriendly platform
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  message: string;
  error?: string;
}

// Note: Direct API calls to Hugging Face are blocked by CORS in browsers
// This implementation uses intelligent keyword-based responses
// For true AI integration, you'll need a backend proxy server

class AIChatService {
  private conversationHistory: ChatMessage[] = [];
  private maxHistoryLength = 10; // Keep last 10 messages for context

  /**
   * Send a message to the AI and get a response
   */
  async sendMessage(userMessage: string): Promise<ChatResponse> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Keep only recent messages to avoid token limits
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }

    // For now, use intelligent fallback responses
    // API integration requires backend proxy to avoid CORS
    const aiMessage = this.getIntelligentResponse(userMessage);

    // Add AI response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: aiMessage
    });

    return {
      message: aiMessage
    };
  }

  /**
   * Get an intelligent context-aware response
   */
  private getIntelligentResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      return "Hi! 👋 I'm your NeighbourFriendly assistant. I can help you:\n\n• Browse and search items\n• Find properties and services\n• List your items for rent\n• Answer questions about the platform\n\nWhat can I help you with today?";
    }

    // Camera and photography
    if (lowerMessage.includes('camera') || lowerMessage.includes('photo')) {
      return "I can help you find cameras! 📷\n\nHere's what to do:\n1. Go to /listings and search for 'camera'\n2. Filter by your location for nearby options\n3. Check pricing (usually ₹500-2000/day)\n4. Contact the owner directly via WhatsApp\n5. Arrange pickup and rental\n\nNeed help with anything specific about camera rentals?";
    }
    
    // Properties
    if (lowerMessage.includes('property') || lowerMessage.includes('properties') || lowerMessage.includes('house') || lowerMessage.includes('flat') || lowerMessage.includes('apartment') || lowerMessage.includes('pg') || lowerMessage.includes('room')) {
      return "Looking for a property? 🏠\n\nHere's how to find one:\n1. Visit /properties to browse available rentals\n2. Filter by bedrooms, price, and location\n3. View photos and details\n4. Contact owners directly via WhatsApp\n\nWe have flats, houses, PG accommodations, and commercial spaces. What type of property are you looking for?";
    }
    
    // Services
    if (lowerMessage.includes('service') || lowerMessage.includes('services') || lowerMessage.includes('dj') || lowerMessage.includes('caterer') || lowerMessage.includes('photographer') || lowerMessage.includes('wedding') || lowerMessage.includes('event')) {
      return "Need a service provider? 🎉\n\nHere's how:\n1. Visit /services to browse categories\n2. Check out DJ, Catering, Photography, and more\n3. View provider profiles and portfolios\n4. Contact them directly via WhatsApp\n\nAll service providers are verified! What service do you need?";
    }
    
    // Pricing
    if (lowerMessage.includes('price') || lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('charge')) {
      return "💰 Pricing Information:\n\n**For Renters:**\n• No platform fees\n• Pay directly to owners\n• Flexible pricing models (hourly, daily, weekly, monthly)\n\n**For Listers:**\n• FREE to list items\n• Premium: ₹499/month for unlimited listings\n• Set your own rental prices\n\nEach listing shows its specific pricing. Browse /listings to see current prices!";
    }
    
    // How it works
    if ((lowerMessage.includes('how') && lowerMessage.includes('work')) || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return "🎯 How NeighbourFriendly works:\n\n**To Rent:**\n1. Browse listings at /listings\n2. View details, photos, and pricing\n3. Contact owner via WhatsApp\n4. Arrange pickup and rental terms\n5. Leave a review after use\n\n**To List:**\n1. Go to /add-item\n2. Fill in details and upload photos\n3. Set your price and availability\n4. Wait for admin approval (24 hours)\n5. Start earning!\n\nIt's that simple! What would you like to do?";
    }

    // Listing items
    if (lowerMessage.includes('list') || lowerMessage.includes('add item') || lowerMessage.includes('rent out') || lowerMessage.includes('earn')) {
      return "📝 Want to list your item and earn money?\n\nHere's how:\n1. Click /add-item\n2. Fill in: title, description, category, price\n3. Upload clear photos (up to 10)\n4. Set availability and pricing model\n5. Submit for approval\n\nYour listing goes live within 24 hours! What would you like to rent out?";
    }

    // Browsing
    if (lowerMessage.includes('browse') || lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('look')) {
      return "🔍 Looking for something?\n\nHere's how to search:\n1. Use the search bar at the top\n2. Or go to /browse to see categories\n3. Filter by category, price, location\n4. Click any item for full details\n\nPopular categories: Cameras, Tools, Furniture, Electronics, Party Supplies. What are you looking for?";
    }

    // Safety and trust
    if (lowerMessage.includes('safe') || lowerMessage.includes('secure') || lowerMessage.includes('trust') || lowerMessage.includes('verify')) {
      return "🔒 Your safety is our priority!\n\n**Safety Features:**\n✅ ID verification for all users\n✅ Admin approval for listings\n✅ User ratings and reviews\n✅ Direct communication with owners\n✅ Report & block features\n✅ 24/7 support\n\n**Tips:**\n• Check user ratings before renting\n• Meet in public places\n• Inspect items before renting\n• Keep communication on platform\n\nFeel safe renting with us!";
    }

    // Contact and support
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
      return "📞 Need help?\n\n**Contact Us:**\n• Email: support@neighbourfriendly.in\n• Response time: Within 24 hours\n\n**Or:**\n• Use this chat for instant help\n• Check our FAQ section\n• Visit /about for more info\n\nI'm here to help! What do you need assistance with?";
    }

    // Premium
    if (lowerMessage.includes('premium') || lowerMessage.includes('upgrade') || lowerMessage.includes('subscription')) {
      return "⭐ Premium Benefits:\n\n✅ Unlimited listings\n✅ Featured placement (top of search)\n✅ Priority support\n✅ Advanced analytics\n✅ Custom branding\n✅ Early access to new features\n\n**Only ₹499/month!**\n\nClick 'Upgrade to Premium' in the menu to get started. Want to know more?";
    }

    // Categories
    if (lowerMessage.includes('category') || lowerMessage.includes('categories') || lowerMessage.includes('what can')) {
      return "📂 Available Categories:\n\n• 📱 Electronics & Cameras\n• 🔧 Tools & Equipment\n• 🛋️ Furniture & Appliances\n• 🏋️ Sports & Fitness\n• 🎸 Musical Instruments\n• 📚 Books & Media\n• 🎉 Party & Events\n• 🎮 Gaming & Consoles\n• ⛺ Outdoor & Camping\n• 👶 Baby & Kids\n• And many more!\n\nClick /browse to see all categories. What are you interested in?";
    }

    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! 😊 Happy to help!\n\nIf you need anything else, just ask. Enjoy using NeighbourFriendly!";
    }

    // Default response with context awareness
    const recentMessages = this.conversationHistory.slice(-3);
    const hasAskedBefore = recentMessages.some(msg => msg.role === 'user');
    
    if (hasAskedBefore) {
      return "I'm here to help! Could you please tell me more about what you're looking for? I can assist with:\n\n• Finding items to rent\n• Listing your items\n• Properties and services\n• Platform questions\n\nWhat would you like to know?";
    }

    return "Hi! I'm your NeighbourFriendly assistant. 👋\n\nI can help you:\n• 🔍 Browse and search items\n• 🏠 Find properties\n• 🛠️ Find services\n• 📝 List your items for rent\n• 💰 Learn about pricing\n• 🔒 Safety and security\n\nWhat are you looking for today?";
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

// Export singleton instance
export const aiChatService = new AIChatService();
