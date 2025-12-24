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

    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      return "Hi! 👋 I'm your NeighbourFriendly assistant. I can help you browse items, list your own, or find properties and services. What can I help you with today?";
    }

    if (lowerMessage.includes('camera') || lowerMessage.includes('photo')) {
      return "I can help you find cameras! 📷\n\nGo to /listings and search for 'camera' to see what's available nearby. Most rentals are ₹500-2000/day. You can contact owners directly via WhatsApp!";
    }
    
    if (lowerMessage.includes('property') || lowerMessage.includes('properties') || lowerMessage.includes('house') || lowerMessage.includes('flat') || lowerMessage.includes('apartment') || lowerMessage.includes('pg') || lowerMessage.includes('room')) {
      return "Looking for a property? 🏠 Visit /properties to browse flats, houses, and PG accommodations. You can filter by price and location.";
    }
    
    if (lowerMessage.includes('service') || lowerMessage.includes('services') || lowerMessage.includes('dj') || lowerMessage.includes('caterer') || lowerMessage.includes('photographer')) {
      return "Need a service provider? 🎉 Visit /services to find DJs, caterers, and photographers in your area. All providers are verified!";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
      return "💰 Pricing is flexible! Renters pay owners directly with no platform fees. Listers can list for free, or get Premium for ₹499/month. Check individual listings for specific rates.";
    }
    
    if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
      return "🎯 It's easy! Renters browse /listings and contact owners via WhatsApp. Listers add items at /add-item and wait for admin approval (24h).";
    }

    if (lowerMessage.includes('list') || lowerMessage.includes('add item') || lowerMessage.includes('earn')) {
      return "📝 Want to list your item? Go to /add-item, fill in the details and photos, and set your price. Your listing will be live within 24 hours!";
    }

    if (lowerMessage.includes('safe') || lowerMessage.includes('secure') || lowerMessage.includes('trust') || lowerMessage.includes('verify')) {
      return "🔒 Safety first! We use ID verification, admin approval for listings, and user reviews. We recommend checking ratings and meeting in public places for handovers.";
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
      return "📞 Need help? You can email us at support@neighbourfriendly.in and we'll get back to you within 24 hours!";
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! 😊 Enjoy using NeighbourFriendly!";
    }

    return "I'm here to help! 👋 I can assist with finding items, listing your own stuff, or answering questions about the platform. What's on your mind?";
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

export const aiChatService = new AIChatService();
