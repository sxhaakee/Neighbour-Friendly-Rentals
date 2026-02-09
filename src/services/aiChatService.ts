/**
 * AI Chat Service
 * Frontend service that communicates with the secure server-side API
 */

interface ChatResponse {
  message: string;
  error?: string;
}

class AIChatService {
  async sendMessage(userMessage: string): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      return data;
    } catch (error: any) {
      console.error('Chat Service Error:', error);
      return {
        message: "I'm having trouble connecting to the server. Please check your internet connection and try again.",
        error: error.message
      };
    }
  }

  clearHistory(): void {
    // History is currently managed by client state or not persisted
    // Server-side history would need session management
  }
}

export const aiChatService = new AIChatService();
