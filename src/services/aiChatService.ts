/**
 * AI Chat Service using Google Gemini API
 * Provides intelligent, context-aware responses for NeighbourFriendly platform ONLY
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatResponse {
  message: string;
  error?: string;
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Comprehensive platform context
const PLATFORM_CONTEXT = `You are the official AI assistant for "NeighbourFriendly Rentals" (NFR), India's premier peer-to-peer rental marketplace.

## CRITICAL RULES:
1. ONLY answer questions about the NeighbourFriendly platform, rental marketplace, and related topics
2. For ANY question unrelated to NFR, rentals, or the sharing economy, politely decline and redirect to platform topics
3. Never provide general knowledge, math, coding help, or other non-platform information
4. Always maintain a friendly, helpful tone with appropriate emojis

## PLATFORM DETAILS:

### What is NeighbourFriendly?
- India's most trusted P2P rental marketplace
- Users can rent out or rent Items, Services, and Properties
- Mission: Share resources, save money, reduce waste
- Currently serving: Bangalore, Moodabidri, Mangalore, and expanding

### Three Main Categories:

1. **ITEMS** (rent cameras, books, tools, etc.)
   - Categories: Books, Electronics, Clothing, Sports Equipment, Tools, Photography, Camping & Outdoor, Musical Instruments, Party & Events, Baby & Kids
   - Browse: /listings or /items
   - List your item: /add-item
   - Pricing: Owners set rates (per hour/day/week/month/event)
   - Popular: Cameras (₹500-2000/day), Camping gear, Power tools

2. **SERVICES** (hire professionals for events)
   - Categories: Photography, Catering, DJ & Music, Makeup Artist, Event Planning, Cleaning, Home Repair, Tutoring, Fitness Training
   - Browse: /services
   - List your service: /add-service
   - All providers are verified and rated
   - Perfect for: Weddings, parties, events, home maintenance

3. **PROPERTIES** (rent apartments, houses, PG)
   - Types: Apartment, House, PG, Office Space, Shop, Warehouse
   - Browse: /properties
   - List property: /add-property
   - Filter by: Price, location, amenities (parking, gym, etc.)

### Key Features:
- **Trust & Safety**: ID verification, manual listing approval, review system
- **Digital Agreements**: Secure rental contracts
- **Location-based Discovery**: Find items near you
- **Google Login**: Easy authentication
- **Direct Communication**: WhatsApp or platform chat
- **Premium Subscription**: ₹499/month for featured listings, unlimited posts, verified badge

### User Journey:
**To Rent Something:**
1. Browse /listings, /properties, or /services
2. Contact owner via chat or WhatsApp
3. Coordinate pickup/handover
4. Enjoy your rental!

**To List Something:**
1. Go to /add-item, /add-service, or /add-property
2. Upload clear photos, set pricing
3. Listing reviewed and approved within 24 hours
4. Start earning! Average: ₹5,000/month

### Important Pages:
- Home: /
- Browse All: /listings
- About: /about
- Contact: /contact
- Premium: /premium
- Dashboard: /dashboard
- Messages: /messages

### Support:
- Email: support@neighbourfriendly.in
- Website: neighbourfriendly.in

### Pricing:
- **For Renters**: Pay the price listed by owners
- **For Listers**: Free to list, or ₹499/month Premium for featured placement

Remember: Be concise, use emojis, and ONLY discuss NeighbourFriendly platform topics!`;

class AIChatService {
  private genAI: GoogleGenerativeAI | null = null;
  private chatSession: any = null;

  constructor() {
    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('your_')) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  async sendMessage(userMessage: string): Promise<ChatResponse> {
    // If no API key, return helpful message
    if (!this.genAI) {
      return {
        message: "🤖 Hi! I'm the NFR assistant. I can help you find items to rent, list your own stuff, or answer questions about our platform! Try asking about 'how to rent a camera' or 'listing my bike'!",
        error: 'NO_API_KEY'
      };
    }

    try {
      // Check if question is off-topic
      const offTopicCheck = this.isOffTopic(userMessage);
      if (offTopicCheck) {
        return { message: offTopicCheck };
      }

      // Initialize chat session if not exists
      if (!this.chatSession) {
        const model = this.genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: PLATFORM_CONTEXT
        });
        this.chatSession = model.startChat({
          history: [],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        });
      }

      // Send message to Gemini
      const result = await this.chatSession.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      return { message: text };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      // Fallback to intelligent responses
      const fallback = this.getFallbackResponse(userMessage);
      return { 
        message: fallback,
        error: error.message 
      };
    }
  }

  private isOffTopic(message: string): string | null {
    const lower = message.toLowerCase();
    
    // Detect off-topic questions
    const offTopicPatterns = [
      /what is \d+\s*[\+\-\*\/]/,  // Math
      /write (a |an )?code/,  // Coding
      /who (is|was|are) (the )?(?!neighbourfriendly)/,  // General knowledge
      /what (is|are) (the )?(capital|president|prime minister)/,  // Geography/Politics
      /tell me about (?!(nfr|neighbourfriendly|rent|platform))/,  // General topics
      /translate|weather|recipe|joke/,  // Other topics
    ];

    for (const pattern of offTopicPatterns) {
      if (pattern.test(lower)) {
        return "I'm specifically designed to help with NeighbourFriendly platform questions! 🏠 \n\nI can assist with:\n• Finding items/services/properties to rent\n• Listing your own items\n• Understanding how our platform works\n\nWhat would you like to know about NFR?";
      }
    }

    return null;
  }

  private getFallbackResponse(message: string): string {
    const lower = message.toLowerCase();

    if (lower.match(/^(hi|hello|hey|good morning|good afternoon)/)) {
      return "Hi! 👋 I'm your NeighbourFriendly assistant. I can help you browse items, list your own, or find properties and services. What can I help you with today?";
    }

    if (lower.includes('camera') || lower.includes('photography')) {
      return "Looking for cameras? 📷 Check out our photography equipment at /listings! We have DSLRs, GoPros, and lenses available for rent. Most are ₹500-2000/day.";
    }

    if (lower.includes('property') || lower.includes('flat') || lower.includes('apartment')) {
      return "Looking for a property? 🏠 Visit /properties to browse flats, houses, and PG accommodations. Filter by price, location, and amenities!";
    }

    if (lower.includes('service') || lower.includes('event')) {
      return "Need service providers? 🎉 Visit /services to find photographers, caterers, DJs, and more for your events!";
    }

    if (lower.includes('list') || lower.includes('add') || lower.includes('earn')) {
      return "Want to list something? 📝 Go to /add-item to list items, /add-service for services, or /add-property for properties. Start earning today!";
    }

    if (lower.includes('premium') || lower.includes('subscription')) {
      return "Go Premium for ₹499/month! 👑 Get featured listings, unlimited posts, and a verified badge. Check it out at /premium.";
    }

    if (lower.includes('contact') || lower.includes('support') || lower.includes('help')) {
      return "Need help? 📞 Contact our support team at support@neighbourfriendly.in or visit /contact!";
    }

    return "I'm here to help with NeighbourFriendly! 🏠 Ask me about renting items, listing your stuff, finding properties, or how our platform works!";
  }

  clearHistory(): void {
    this.chatSession = null;
  }
}

export const aiChatService = new AIChatService();
