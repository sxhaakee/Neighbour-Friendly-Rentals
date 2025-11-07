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

const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';

// System prompt that defines the AI assistant's personality and knowledge
const SYSTEM_PROMPT = `You are a helpful and friendly AI assistant for NeighbourFriendly, India's leading peer-to-peer (P2P) rental marketplace. Your role is to guide users through the platform and answer their questions naturally.

ABOUT NEIGHBOURFRIENDLY:
- Platform: NeighbourFriendly (Neighbour Friendly)
- Type: Peer-to-peer rental marketplace
- Location: India
- Mission: Connect local neighbours to rent items, properties, and services

WHAT WE OFFER:
1. ITEMS: Cameras, equipment, furniture, appliances, tools, vehicles, bikes, cars, electronics, party supplies
2. PROPERTIES: Flats, houses, PG, hostels, rooms, commercial spaces, offices, shops
3. SERVICES: Photography, catering, DJ, event planning, wedding services, home services

PRICING MODELS:
- Per Hour, Per Day, Per Week, Per Month, Per Event

HOW IT WORKS:
1. Browse listings or search
2. View details, photos, pricing
3. Contact owner directly
4. Arrange rental
5. Leave reviews

KEY PAGES:
- Browse: /browse
- Items: /listings
- Services: /services
- Properties: /properties
- Add Item: /add-item
- Dashboard: /dashboard

Be concise, helpful, and conversational. Guide users to the right pages.`;

class AIChatService {
  private conversationHistory: ChatMessage[] = [];
  private maxHistoryLength = 10; // Keep last 10 messages for context

  /**
   * Send a message to the AI and get a response
   */
  async sendMessage(userMessage: string): Promise<ChatResponse> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Keep only recent messages to avoid token limits
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
      }

      // Build the prompt with conversation history
      const prompt = this.buildPrompt();

      // Call Hugging Face API
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 250,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the generated text
      let aiMessage = '';
      if (Array.isArray(data) && data.length > 0) {
        aiMessage = data[0].generated_text || '';
      } else if (data.generated_text) {
        aiMessage = data.generated_text;
      }

      // Clean up the response
      aiMessage = this.cleanResponse(aiMessage);

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiMessage
      });

      return {
        message: aiMessage
      };

    } catch (error) {
      console.error('AI Chat Error:', error);
      return {
        message: this.getFallbackResponse(userMessage),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build the prompt with system instructions and conversation history
   */
  private buildPrompt(): string {
    let prompt = `<s>[INST] ${SYSTEM_PROMPT}\n\n`;

    // Add conversation history
    const recentHistory = this.conversationHistory.slice(-6); // Last 3 exchanges
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n`;
      }
    }

    prompt += `\nAssistant: [/INST]`;
    return prompt;
  }

  /**
   * Clean up the AI response
   */
  private cleanResponse(response: string): string {
    // Remove any system prompt leakage
    let cleaned = response.trim();
    
    // Remove common artifacts
    cleaned = cleaned.replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/g, '');
    cleaned = cleaned.replace(/^(Assistant:|User:)/gi, '');
    cleaned = cleaned.trim();

    // If response is too short or empty, use fallback
    if (cleaned.length < 10) {
      return "I'm here to help! Could you please tell me more about what you're looking for?";
    }

    return cleaned;
  }

  /**
   * Get a fallback response when AI fails
   */
  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Keyword-based fallback responses
    if (lowerMessage.includes('camera') || lowerMessage.includes('photo')) {
      return "I can help you find cameras! Browse our camera listings at /listings or search for 'camera'. You can filter by location and price. Need help with anything specific?";
    }
    
    if (lowerMessage.includes('property') || lowerMessage.includes('house') || lowerMessage.includes('flat') || lowerMessage.includes('pg')) {
      return "Looking for a property? Check out our properties section at /properties. We have flats, houses, PG, and commercial spaces. What type of property are you looking for?";
    }
    
    if (lowerMessage.includes('service') || lowerMessage.includes('dj') || lowerMessage.includes('caterer') || lowerMessage.includes('photographer')) {
      return "Need a service provider? Visit /services to find DJs, photographers, caterers, and more. All verified professionals. What service do you need?";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rent')) {
      return "We offer flexible pricing: per hour, per day, per week, per month, or per event. Each listing shows its pricing. Browse /listings to see current prices in your area!";
    }
    
    if (lowerMessage.includes('how') || lowerMessage.includes('work')) {
      return "It's simple! 1) Browse listings 2) View details and photos 3) Contact the owner 4) Arrange the rental 5) Leave a review. Start browsing at /browse!";
    }

    // Default fallback
    return "I'm here to help you with NeighbourFriendly! You can browse items (/listings), properties (/properties), or services (/services). What are you looking for today?";
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
