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
// This implementation uses a real fetch call with intelligent fallback
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

const SYSTEM_PROMPT = `You are a helpful, friendly AI assistant for "NeighbourFriendly", India's premier P2P rental marketplace.
Your goal is to help users navigate the platform, find items/properties/services, and understand how renting works.

Platform Knowledge:
- Browse Items: /listings
- Add/List an Item: /add-item
- Find Properties: /properties
- Find Services: /services
- About Us: /about
- Contact Support: support@neighbourfriendly.in
- Pricing: Per hour, day, week, month, or event. Owners set prices.
- Trust: Verified users, ID checks, and platform reviews.

Guidelines:
- If a user wants to find something, guide them to /listings, /properties, or /services.
- If a user wants to earn money, guide them to /add-item.
- Keep responses concise and use emojis for a friendly tone.
- If unsure, provide the support email.
`;

class AIChatService {
  private conversationHistory: ChatMessage[] = [];
  private maxHistoryLength = 8;

  async sendMessage(userMessage: string): Promise<ChatResponse> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }

    // Try Real AI API First
    if (API_KEY && !API_KEY.includes('your_actual_token')) {
      try {
        const fullPrompt = `${SYSTEM_PROMPT}\n\n${this.conversationHistory
          .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n')}\nAssistant:`;

        const response = await fetch(HUGGINGFACE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
              max_new_tokens: 300,
              temperature: 0.7,
              return_full_text: false,
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        let aiMessage = '';

        if (Array.isArray(data) && data[0]?.generated_text) {
          aiMessage = data[0].generated_text.split('User:')[0].split('Assistant:')[0].trim();
        } else if (data.generated_text) {
          aiMessage = data.generated_text.split('User:')[0].split('Assistant:')[0].trim();
        }

        if (aiMessage) {
          this.conversationHistory.push({
            role: 'assistant',
            content: aiMessage
          });
          return { message: aiMessage };
        }
      } catch (error) {
        console.error('Hugging Face API failed, falling back:', error);
      }
    }

    // Add a small delay for local processing to feel more natural
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    // Fallback to intelligent pattern matching if API fails or no key
    const fallbackMessage = this.getIntelligentResponse(userMessage);
    this.conversationHistory.push({
      role: 'assistant',
      content: fallbackMessage
    });

    return { message: fallbackMessage };
  }

  private getIntelligentResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Positive Greetings
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greeting)/)) {
      return "Hi! 👋 I'm your NeighbourFriendly assistant. I can help you browse items, list your own, or find properties and services. What can I help you with today?";
    }

    // Items and Categories
    if (lowerMessage.includes('camera') || lowerMessage.includes('dslr') || lowerMessage.includes('gopro') || lowerMessage.includes('photo')) {
      return "I can help you find cameras! 📷\n\nGo to /listings and search for 'camera' to see what's available nearby. Most rentals are ₹500-2000/day. You can contact owners directly via WhatsApp or platform chat!";
    }
    
    if (lowerMessage.includes('cycle') || lowerMessage.includes('bike') || lowerMessage.includes('scooter') || lowerMessage.includes('bicycle')) {
      return "Looking for a ride? 🚲 Check out our bikes and cycles at /listings. Perfect for a weekend trip or daily commute!";
    }

    if (lowerMessage.includes('camping') || lowerMessage.includes('tent') || lowerMessage.includes('trekking') || lowerMessage.includes('outdoor')) {
      return "Planning an adventure? 🏕️ We have camping gear, tents, and trekking equipment available at /listings. Happy camping!";
    }

    if (lowerMessage.includes('laptop') || lowerMessage.includes('computer') || lowerMessage.includes('monitor') || lowerMessage.includes('electronics')) {
      return "Need tech gear? 💻 Browse laptops and accessories at /listings. Great for short-term work or testing new gadgets!";
    }

    // Properties
    if (lowerMessage.includes('property') || lowerMessage.includes('properties') || lowerMessage.includes('house') || lowerMessage.includes('flat') || lowerMessage.includes('apartment') || lowerMessage.includes('pg') || lowerMessage.includes('room') || lowerMessage.includes('rent')) {
      return "Looking for a property? 🏠 Visit /properties to browse flats, houses, and PG accommodations. You can filter by price, location, and amenities like parking or gym!";
    }

    if (lowerMessage.includes('office') || lowerMessage.includes('coworking') || lowerMessage.includes('commercial') || lowerMessage.includes('shop')) {
      return "Looking for commercial space? 🏢 Check out our office and shop listings at /properties. Perfect for growing your business!";
    }
    
    // Services
    if (lowerMessage.includes('service') || lowerMessage.includes('services') || lowerMessage.includes('dj') || lowerMessage.includes('caterer') || lowerMessage.includes('catering') || lowerMessage.includes('photographer') || lowerMessage.includes('makeup')) {
      return "Need a service provider for an event? 🎉 Visit /services to find DJs, caterers, photographers, and makeup artists in your area. All providers are verified and rated!";
    }
    
    if (lowerMessage.includes('wedding') || lowerMessage.includes('party') || lowerMessage.includes('event') || lowerMessage.includes('birthday')) {
      return "Planning an event? 🎊 We have amazing service providers at /services and party rental gear at /listings. Let's make your celebration special!";
    }

    // Pricing and Money
    if (lowerMessage.includes('price') || lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('money')) {
      return "💰 Pricing is transparent! Renters pay the price listed by owners. Listers can list for free, but we offer a Premium subscription for ₹499/month which gives you featured placement and unlimited listings!";
    }

    if (lowerMessage.includes('earn') || lowerMessage.includes('income') || lowerMessage.includes('rent my') || lowerMessage.includes('extra cash')) {
      return "💵 Want to earn from your idle items? List them at /add-item! Our users earn an average of ₹5,000/month by renting out cameras, camping gear, and appliances.";
    }
    
    // How it works / Process
    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('use') || lowerMessage.includes('book'))) {
      return "🎯 It's a simple 3-step process:\n1. Browse /listings, /properties, or /services\n2. Contact the owner via chat or WhatsApp\n3. Coordinate the handover and enjoy your rental!";
    }

    if (lowerMessage.includes('list') || lowerMessage.includes('add item') || lowerMessage.includes('post')) {
      return "📝 Want to list something? Go to /add-item, upload clear photos, and set your daily/weekly price. Your listing will be reviewed by our team and go live within 24 hours!";
    }

    // Security and Trust
    if (lowerMessage.includes('safe') || lowerMessage.includes('secure') || lowerMessage.includes('trust') || lowerMessage.includes('verify') || lowerMessage.includes('id proof')) {
      return "🔒 Safety is our top priority! We verify users through ID checks, manually approve all listings, and maintain a review system. We always recommend meeting in a public place for the initial handover!";
    }

    // Support
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('complain') || lowerMessage.includes('issue')) {
      return "📞 Need assistance? You can reach our support team at support@neighbourfriendly.in or visit our Contact page at /contact. We're here to help!";
    }

    // About
    if (lowerMessage.includes('who are you') || lowerMessage.includes('about') || lowerMessage.includes('company') || lowerMessage.includes('what is neighbourfriendly')) {
      return "🏢 NeighbourFriendly is India's most trusted P2P rental marketplace. We believe in sharing resources within the community to save money and reduce waste. Learn more at /about!";
    }

    // Premium
    if (lowerMessage.includes('premium') || lowerMessage.includes('gold') || lowerMessage.includes('plus') || lowerMessage.includes('upgrade')) {
      return "👑 Go Premium for just ₹499! Get featured listings, unlimited posts, and a verified badge that builds trust. Check it out at /premium.";
    }

    // Polite Endings
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      return "You're very welcome! 😊 Is there anything else I can help you find today?";
    }

    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('later')) {
      return "Goodbye! 👋 Hope to see you back on NeighbourFriendly soon!";
    }

    return "I'm here to help! 👋 I can assist with finding items for rent, listing your own stuff, or answering any questions about NeighbourFriendly. Try asking about 'how to rent' or 'listing a camera'!";
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

export const aiChatService = new AIChatService();
